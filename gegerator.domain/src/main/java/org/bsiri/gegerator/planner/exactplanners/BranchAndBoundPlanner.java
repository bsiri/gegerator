package org.bsiri.gegerator.planner.exactplanners;

import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.TimeAndSpaceLocation;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.Duration;
import java.util.*;

/**
 * Exact planner: it returns a roadmap of maximum cumulative score, and can tell
 * whether it had the time to prove it (see {@link #isOptimal()}).
 *
 * <h2>The problem</h2>
 * Pick a set of events of maximum total score such that no two events overlap
 * (travel time included) and no movie is planned twice. In the literature this is
 * the (weighted) Job Interval Selection Problem, which is NP-hard. Without the
 * "a movie at most once" rule it would merely be a longest path in a DAG, which is
 * easy. This is what this planner exploits.
 *
 * <h2>How it works</h2>
 * It is a branch-and-bound:
 * <ul>
 *     <li><b>Bound</b>: the movie rule is relaxed. Instead of being forbidden, planning
 *     a movie costs a toll (one toll per movie, the "Lagrange multipliers"). For any
 *     tolls, "sum of the tolls + longest path with scores lowered by the tolls" is an
 *     upper bound of what any valid roadmap can score. The tolls are then tuned to make
 *     that bound as low as possible (subgradient method). The longest path is computed
 *     day by day, since days only interact through the movie rule.</li>
 *     <li><b>Incumbent</b>: each longest path is repaired into a valid roadmap (drop the
 *     duplicates, fill the holes greedily), the best one found so far is kept.</li>
 *     <li><b>Fixing</b>: an event is discarded for good when the best path that goes
 *     through it is bounded below the incumbent.</li>
 *     <li><b>Branch</b>: when bound and incumbent still disagree, an event is picked
 *     and both cases (planned / not planned) are explored recursively.</li>
 * </ul>
 * The search stops when the bound proves no better roadmap exists, or when the time
 * budget is elapsed, in which case the best roadmap found so far is returned.
 *
 * <h2>Notes</h2>
 * <ul>
 *     <li>Events with a score of zero or less are never planned.</li>
 *     <li>Two events are compatible according to {@link TimeAndSpaceLocation#overlap}, and
 *     all pairs of a roadmap are checked (not only consecutive events).</li>
 *     <li>There is no limit on the number of events.</li>
 * </ul>
 */
public class BranchAndBoundPlanner implements WizardPlanner {

    public static final Duration DEFAULT_TIME_BUDGET = Duration.ofMillis(1500);

    private static final double EPSILON = 1e-6;
    private static final int ROOT_ITERATIONS = 300;
    private static final int NODE_ITERATIONS = 20;
    /* Reading the clock is not free : it is done once every that many nodes of the search tree */
    private static final int NODES_BETWEEN_CLOCK_CHECKS = 8;
    /* A long has 64 bits, and 64 is 2^6 : shifting right by 6 divides by 64 */
    private static final int BITS_PER_WORD = 64;
    private static final int WORD_SHIFT = 6;

    private final long timeBudgetNanos;

    // ******** problem description (immutable once initialized) ********

    /* Events of positive score, sorted chronologically. */
    private PlannerEvent[] events;
    private int nbEvents;
    /*
     * Sets of events are stored as bitsets : one bit per event, set to 1 if the event
     * belongs to the set. A long only has 64 bits, so a bitset is an array of longs
     * ("words") laid end to end : word 0 holds the events 0 to 63, word 1 holds the
     * events 64 to 127, etc. Thus the event i is found at :
     * - word number i / 64,
     * - bit number i % 64 of that word.
     * For instance, the event 70 is the bit 6 of the word 1.
     * See the methods isSet, add and remove at the end of the class.
     *
     * The point of bitsets is speed : the union or the difference of two sets
     * takes one operation per word, instead of one per event.
     */
    /* Number of words (longs) required for a bitset that can hold all the events */
    private int nbWords;
    private long[] score;
    /* Any valid roadmap score is a multiple of this */
    private long scoreStep;
    private int nbMovies;
    private int[] movie;
    /* conflicts[i] : bitset of the events that cannot be planned along with i (time or movie) */
    private long[][] conflicts;
    /* Events of the same day that can be planned after (resp. before) i */
    private int[][] successors;
    private int[][] predecessors;
    /* Events of day d are those of indices dayStart[d] (included) to dayStart[d+1] (excluded) */
    private int[] dayStart;
    private int nbDays;
    private int[] eventsByScoreDesc;

    // ******** search state ********

    private long deadline;
    private boolean timedOut;
    private long exploredNodes;

    private long bestScore;
    private int[] bestRoadmap;
    private int bestRoadmapLength;

    /* The events planned by the branching decisions so far */
    private int[] planned;
    private int nbPlanned;

    // scratch data, results of the last call to longestPaths()
    private double[] forward;
    private double[] backward;
    private int[] next;
    private double[] dayBest;
    private int[] dayHead;
    private int[] path;
    private int pathLength;
    private int[] movieCount;
    private int[] activeSessions;
    private long[] blocked;
    private int[] candidate;


    public BranchAndBoundPlanner(Collection<PlannerEvent> events) {
        this(events, DEFAULT_TIME_BUDGET);
    }

    public BranchAndBoundPlanner(Collection<PlannerEvent> events, Duration timeBudget) {
        this.timeBudgetNanos = timeBudget.toNanos();
        initEvents(events);
        initMovies();
        initConflicts();
        initScratch();
    }

    /**
     * @return true if the roadmap returned by the last call to findBestRoadmap() is proven
     * to be optimal, false if the time budget elapsed before the proof was complete.
     */
    public boolean isOptimal() {
        return !timedOut;
    }

    /**
     * @return the number of nodes of the search tree explored by the last call to findBestRoadmap()
     */
    public long getExploredNodes() {
        return exploredNodes;
    }

    // ******************* Initialization ************************

    private void initEvents(Collection<PlannerEvent> orig) {
        List<PlannerEvent> sorted = new ArrayList<>();
        for (PlannerEvent event : orig) {
            if (event.getScore() > 0) sorted.add(event);
        }
        sorted.sort(Comparator.comparing(PlannerEvent::getDay)
                .thenComparing(PlannerEvent::getStartTime)
                .thenComparing(PlannerEvent::getEndTime)
                .thenComparing(PlannerEvent::getName, Comparator.nullsFirst(Comparator.naturalOrder())));

        events = sorted.toArray(new PlannerEvent[0]);
        nbEvents = events.length;
        // ie nbEvents / 64, rounded up
        nbWords = (nbEvents + BITS_PER_WORD - 1) >>> WORD_SHIFT;

        score = new long[nbEvents];
        scoreStep = 0;
        for (int i = 0; i < nbEvents; i++) {
            score[i] = events[i].getScore();
            scoreStep = gcd(scoreStep, score[i]);
        }
        scoreStep = Math.max(scoreStep, 1);

        // days
        List<Integer> starts = new ArrayList<>();
        DayOfWeek current = null;
        for (int i = 0; i < nbEvents; i++) {
            if (events[i].getDay() != current) {
                current = events[i].getDay();
                starts.add(i);
            }
        }
        nbDays = starts.size();
        starts.add(nbEvents);
        dayStart = starts.stream().mapToInt(Integer::intValue).toArray();

        Integer[] byScore = new Integer[nbEvents];
        for (int i = 0; i < nbEvents; i++) byScore[i] = i;
        Arrays.sort(byScore, (a, b) -> Long.compare(score[b], score[a]));
        eventsByScoreDesc = Arrays.stream(byScore).mapToInt(Integer::intValue).toArray();
    }

    private void initMovies() {
        movie = new int[nbEvents];
        Map<Long, Integer> movieIndex = new HashMap<>();
        nbMovies = 0;
        for (int i = 0; i < nbEvents; i++) {
            Long movieId = events[i].getMovie();
            if (movieId == null) {
                // not a movie: it cannot be redundant with anything
                movie[i] = nbMovies++;
            } else {
                Integer index = movieIndex.get(movieId);
                if (index == null) {
                    index = nbMovies++;
                    movieIndex.put(movieId, index);
                }
                movie[i] = index;
            }
        }
    }

    private void initConflicts() {
        conflicts = new long[nbEvents][nbWords];
        for (int i = 0; i < nbEvents; i++) {
            for (int j = i + 1; j < nbEvents; j++) {
                if (movie[i] == movie[j] || TimeAndSpaceLocation.overlap(events[i], events[j])) {
                    add(conflicts[i], j);
                    add(conflicts[j], i);
                }
            }
        }

        successors = new int[nbEvents][];
        predecessors = new int[nbEvents][];
        int[] buffer = new int[nbEvents];
        for (int day = 0; day < nbDays; day++) {
            for (int i = dayStart[day]; i < dayStart[day + 1]; i++) {
                int count = 0;
                for (int j = i + 1; j < dayStart[day + 1]; j++) {
                    if (!isSet(conflicts[i], j)) buffer[count++] = j;
                }
                successors[i] = Arrays.copyOf(buffer, count);

                count = 0;
                for (int j = dayStart[day]; j < i; j++) {
                    if (!isSet(conflicts[i], j)) buffer[count++] = j;
                }
                predecessors[i] = Arrays.copyOf(buffer, count);
            }
        }
    }

    private void initScratch() {
        forward = new double[nbEvents];
        backward = new double[nbEvents];
        next = new int[nbEvents];
        dayBest = new double[nbDays];
        dayHead = new int[nbDays];
        path = new int[nbEvents];
        movieCount = new int[nbMovies];
        activeSessions = new int[nbMovies];
        blocked = new long[nbWords];
        candidate = new int[nbEvents];
        planned = new int[nbEvents];
        bestRoadmap = new int[nbEvents];
    }

    private static long gcd(long a, long b) {
        while (b != 0) {
            long tmp = a % b;
            a = b;
            b = tmp;
        }
        return a;
    }

    // ******************* Computation ************************

    @Override
    public List<PlannerEvent> findBestRoadmap() {
        deadline = System.nanoTime() + timeBudgetNanos;
        timedOut = false;
        exploredNodes = 0;
        bestScore = 0;
        bestRoadmapLength = 0;
        nbPlanned = 0;

        if (nbEvents > 0) {
            long[] allEvents = new long[nbWords];
            for (int i = 0; i < nbEvents; i++) add(allEvents, i);
            explore(allEvents, new double[nbMovies], 0, ROOT_ITERATIONS);
        }

        // indices are sorted chronologically, and so will be the result
        int[] roadmap = Arrays.copyOf(bestRoadmap, bestRoadmapLength);
        Arrays.sort(roadmap);
        List<PlannerEvent> result = new ArrayList<>(roadmap.length);
        for (int index : roadmap) result.add(events[index]);
        return result;
    }

    /**
     * Explores a node of the search tree.
     *
     * @param active      the events that can still be planned, given the decisions made so far
     * @param parentTolls the tolls of the parent node, used as a starting point
     * @param baseScore   the cumulative score of the events planned by the decisions made so far
     */
    private void explore(long[] active, double[] parentTolls, long baseScore, int maxIterations) {
        if (timedOut) return;
        // the root node is always explored, so there is always a decent roadmap to return
        boolean isRoot = (exploredNodes == 0);
        exploredNodes++;
        if (!isRoot && exploredNodes % NODES_BETWEEN_CLOCK_CHECKS == 0 && System.nanoTime() > deadline) {
            timedOut = true;
            return;
        }

        double[] tolls = parentTolls.clone();
        countActiveSessions(active);
        disableUselessTolls(tolls);

        // *** step 1 : tune the tolls to lower the upper bound as much as possible ***
        double[] bestTolls = tolls.clone();
        double bestBound = Double.POSITIVE_INFINITY;
        double stepFactor = 2.0;
        int stalled = 0;

        for (int iteration = 0; iteration < maxIterations; iteration++) {
            double bound = baseScore + longestPaths(active, tolls);
            extractPath();
            repairAndRecord(active, baseScore);

            if (bound < bestBound - EPSILON) {
                bestBound = bound;
                System.arraycopy(tolls, 0, bestTolls, 0, nbMovies);
                stalled = 0;
            } else if (++stalled >= 5) {
                stepFactor /= 2;
                stalled = 0;
                if (stepFactor < 1e-3) break;
            }

            if (cannotImprove(bestBound)) return;

            // subgradient : for each movie, 1 - (number of times it is planned in the path).
            double norm = 0;
            for (int m = 0; m < nbMovies; m++) {
                if (activeSessions[m] < 2) continue;
                int gradient = 1 - movieCount[m];
                if (gradient > 0 && tolls[m] == 0) continue;
                norm += gradient * gradient;
            }
            // the path is a valid roadmap and the bound is tight : it has been recorded
            // by repairAndRecord, there is nothing more to learn here
            if (norm == 0) return;

            double step = stepFactor * Math.max(bound - bestScore, scoreStep) / norm;
            for (int m = 0; m < nbMovies; m++) {
                if (activeSessions[m] < 2) continue;
                tolls[m] = Math.max(0, tolls[m] - step * (1 - movieCount[m]));
            }
        }

        // *** step 2 : discard the events that cannot be part of a better roadmap ***
        long[] remaining = active.clone();
        double pathsScore = longestPaths(remaining, bestTolls);
        if (discardHopelessEvents(remaining, bestTolls, baseScore, pathsScore)) {
            countActiveSessions(remaining);
            disableUselessTolls(bestTolls);
            pathsScore = longestPaths(remaining, bestTolls);
            if (cannotImprove(baseScore + pathsScore)) return;
        }
        extractPath();
        repairAndRecord(remaining, baseScore);
        if (cannotImprove(baseScore + pathsScore)) return;

        // *** step 3 : branch ***
        int branchEvent = pickBranchingEvent(remaining, bestTolls);
        if (branchEvent < 0) return;

        // first, the case where the event is planned
        long[] child = remaining.clone();
        long[] eventConflicts = conflicts[branchEvent];
        // child = remaining minus the conflicts of the event, word by word
        for (int w = 0; w < nbWords; w++) child[w] &= ~eventConflicts[w];
        remove(child, branchEvent);
        planned[nbPlanned++] = branchEvent;
        explore(child, bestTolls, baseScore + score[branchEvent], NODE_ITERATIONS);
        nbPlanned--;

        // then, the case where it is not
        remove(remaining, branchEvent);
        explore(remaining, bestTolls, baseScore, NODE_ITERATIONS);
    }

    private boolean cannotImprove(double bound) {
        return bound < bestScore + scoreStep - EPSILON;
    }

    private void countActiveSessions(long[] active) {
        Arrays.fill(activeSessions, 0);
        for (int i = 0; i < nbEvents; i++) {
            if (isSet(active, i)) activeSessions[movie[i]]++;
        }
    }

    /* A movie that has less than two sessions left cannot be planned twice : no toll needed. */
    private void disableUselessTolls(double[] tolls) {
        for (int m = 0; m < nbMovies; m++) {
            if (activeSessions[m] < 2) tolls[m] = 0;
        }
    }

    /**
     * For each day, computes the longest path among the active events, the score
     * of an event being lowered by the toll of its movie. As a result:
     * - forward[i] is the score of the best path that starts at i,
     * - next[i] is the event that follows i in that path (or -1),
     * - dayBest[d] and dayHead[d] are the score and the first event of the best path of the day.
     *
     * @return the sum of the tolls and of the scores of the best path of each day,
     * which is an upper bound of the score of any valid roadmap made of active events.
     */
    private double longestPaths(long[] active, double[] tolls) {
        double total = 0;
        for (int m = 0; m < nbMovies; m++) total += tolls[m];

        for (int day = 0; day < nbDays; day++) {
            double best = 0;
            int head = -1;
            for (int i = dayStart[day + 1] - 1; i >= dayStart[day]; i--) {
                if (!isSet(active, i)) {
                    forward[i] = Double.NEGATIVE_INFINITY;
                    continue;
                }
                double bestNext = 0;
                int nextEvent = -1;
                for (int j : successors[i]) {
                    // inactive events are at -Infinity and are thus ignored
                    if (forward[j] > bestNext) {
                        bestNext = forward[j];
                        nextEvent = j;
                    }
                }
                forward[i] = score[i] - tolls[movie[i]] + bestNext;
                next[i] = nextEvent;
                if (forward[i] > best) {
                    best = forward[i];
                    head = i;
                }
            }
            dayBest[day] = best;
            dayHead[day] = head;
            total += best;
        }
        return total;
    }

    /* Collects the events of the paths found by longestPaths, and counts how many times each movie is planned */
    private void extractPath() {
        pathLength = 0;
        Arrays.fill(movieCount, 0);
        for (int day = 0; day < nbDays; day++) {
            for (int i = dayHead[day]; i >= 0; i = next[i]) {
                path[pathLength++] = i;
                movieCount[movie[i]]++;
            }
        }
    }

    /**
     * Turns the current path into a valid roadmap: first the events of the path are planned
     * by descending score unless redundant, then any other event that still fits.
     * The roadmap is recorded if it is the best so far.
     */
    private void repairAndRecord(long[] active, long baseScore) {
        Arrays.fill(blocked, 0);
        long total = baseScore;
        int count = 0;

        // sort the path by descending score (insertion sort, the path is short)
        for (int i = 1; i < pathLength; i++) {
            int event = path[i];
            int j = i - 1;
            while (j >= 0 && score[path[j]] < score[event]) {
                path[j + 1] = path[j];
                j--;
            }
            path[j + 1] = event;
        }

        for (int p = 0; p < pathLength; p++) {
            int event = path[p];
            if (isSet(blocked, event)) continue;
            candidate[count++] = event;
            total += score[event];
            block(event);
        }
        for (int event : eventsByScoreDesc) {
            if (!isSet(active, event) || isSet(blocked, event)) continue;
            candidate[count++] = event;
            total += score[event];
            block(event);
        }

        if (total > bestScore) {
            bestScore = total;
            System.arraycopy(planned, 0, bestRoadmap, 0, nbPlanned);
            System.arraycopy(candidate, 0, bestRoadmap, nbPlanned, count);
            bestRoadmapLength = nbPlanned + count;
        }
    }

    private void block(int event) {
        long[] eventConflicts = conflicts[event];
        // blocked = blocked plus the conflicts of the event, word by word
        for (int w = 0; w < nbWords; w++) blocked[w] |= eventConflicts[w];
        add(blocked, event);
    }

    /**
     * Removes from the active events those which cannot be part of a roadmap better than the
     * incumbent, ie when the best path going through that event is not good enough.
     * Must be called right after longestPaths(active, tolls).
     */
    private boolean discardHopelessEvents(long[] active, double[] tolls, long baseScore, double pathsScore) {
        boolean discarded = false;
        for (int day = 0; day < nbDays; day++) {
            double otherDays = baseScore + pathsScore - dayBest[day];
            for (int i = dayStart[day]; i < dayStart[day + 1]; i++) {
                if (!isSet(active, i)) {
                    backward[i] = Double.NEGATIVE_INFINITY;
                    continue;
                }
                double bestPrevious = 0;
                for (int j : predecessors[i]) {
                    if (backward[j] > bestPrevious) bestPrevious = backward[j];
                }
                backward[i] = score[i] - tolls[movie[i]] + bestPrevious;
            }
            for (int i = dayStart[day]; i < dayStart[day + 1]; i++) {
                if (!isSet(active, i)) continue;
                double through = bestPreviousOf(i) + forward[i];
                if (cannotImprove(otherDays + through)) {
                    remove(active, i);
                    discarded = true;
                }
            }
        }
        return discarded;
    }

    /* score of the best path that ends right before i (backward[i] minus the own score of i) */
    private double bestPreviousOf(int i) {
        double bestPrevious = 0;
        for (int j : predecessors[i]) {
            if (backward[j] > bestPrevious) bestPrevious = backward[j];
        }
        return bestPrevious;
    }

    /**
     * Picks the event the search will branch on, given the current path :
     * 1. preferably the best event of a movie planned several times,
     * 2. else the best session of the movie that has the highest toll yet is not planned,
     * 3. else the best event of any movie that still has several sessions.
     *
     * @return the event index, or -1 if there is nothing left to decide.
     */
    private int pickBranchingEvent(long[] active, double[] tolls) {
        int pick = -1;
        for (int p = 0; p < pathLength; p++) {
            int event = path[p];
            if (movieCount[movie[event]] < 2) continue;
            if (pick < 0 || score[event] > score[pick]) pick = event;
        }
        if (pick >= 0) return pick;

        int pickMovie = -1;
        for (int m = 0; m < nbMovies; m++) {
            if (activeSessions[m] < 2 || movieCount[m] > 0 || tolls[m] <= 0) continue;
            if (pickMovie < 0 || tolls[m] > tolls[pickMovie]) pickMovie = m;
        }
        for (int event : eventsByScoreDesc) {
            if (!isSet(active, event)) continue;
            if (pickMovie >= 0 ? movie[event] == pickMovie : activeSessions[movie[event]] >= 2) return event;
        }
        return -1;
    }

    // ******************* Bitsets ************************

    /*
     * In the three methods below :
     * - 'index >>> WORD_SHIFT' is index / 64 : the word that holds the bit of that event,
     * - '1L << index' is a long with a single bit set, at position index % 64. The modulo
     *   is implicit : when shifting a long, Java only considers the lowest 6 bits of the
     *   shift distance.
     */

    /* Tells if the event belongs to the set : word AND bit is non-zero only if the bit is set */
    private static boolean isSet(long[] bitset, int index) {
        return (bitset[index >>> WORD_SHIFT] & (1L << index)) != 0;
    }

    /* Adds the event to the set : word OR bit switches the bit on */
    private static void add(long[] bitset, int index) {
        bitset[index >>> WORD_SHIFT] |= 1L << index;
    }

    /* Removes the event from the set : word AND (everything but the bit) switches the bit off */
    private static void remove(long[] bitset, int index) {
        bitset[index >>> WORD_SHIFT] &= ~(1L << index);
    }
}
