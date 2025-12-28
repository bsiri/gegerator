package org.bsiri.gegerator.planner.graphplanners;


import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;

/**
    Slightly optimized version of IterativePlanner. Here again the event
    grid is modeled as a graph between MovieSession that are technically
    compatible (no overlap, and it is humanely possible to travel from
     event A to event B in time), and the goal is to find which path
     yields the highest score while still featuring a movie at most once.

    Iterative Planner v1 was rather crappy because of too many branch miss,
    so in this one we attempt to reduce the number of branches as well.

    This planner do an exhaustive search of optimum and returns an exact
    solution. It works in reasonable time for low number of events on a
    consumer grade hardware (about 30 events), but will hog the cpu for
    large number of events due to the exponential growth of the possible
    paths in the graph (a full grid of four days have around 10^17
    possible paths !).

    For larger volumes you should consider alternative implementations.
 */
public class IterativeGraphPlannerV2 implements WizardPlanner {


    private static final Long ROOT_MOVIE = -9999L;
    private static final Long SINK_MOVIE = -9998L;

    private static final PlannerEvent ROOT = new PlannerEvent(
            null,
            "ROOT",
            0,
            ROOT_MOVIE,
            null,
            DayOfWeek.TUESDAY,
            LocalTime.of(0, 1),
            LocalTime.of(0,2)
    );

    private static final PlannerEvent SINK = new PlannerEvent(
            null,
            "SINK",
            0,
            SINK_MOVIE,
            null,
            DayOfWeek.SUNDAY,
            LocalTime.of(23, 58),
            LocalTime.of(23,59)
    );

    /*
     * The event nodes will be sorted by Day, then by startTime,
     * taking advantage of the fact that if event B starts after
     * event A, then event B cannot possibly end before the start
     * of event A.
     *
     * Since the adjacency matrix structure reflects the structure
     * of time (always onward), this allows us to shortcut a good
     * amount of loop iterations (e.g., loop over i<j) instead of
     * exploring the whole N² combinations.
     */
    private PlannerEvent[] nodes;

    /* The value for each entry is 1 if a connection
     * is possible and 0 otherwise.
     * The first axis is the index of the source event,
     * the second axis is for the destination event.
     *
     * Since we assume that the events are sorted chronologically
     * (see remarks above), this matrix will be quasi-diagonal).
     */
    private int[][] adjacency;

    private int[] nodes_movie_id;
    private long[] nodes_score;

    public IterativeGraphPlannerV2(Collection<PlannerEvent> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<PlannerEvent> orig){
        List<PlannerEvent> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        copy.add(SINK);

        // sort by datetime so that we can iterate more efficiently later
        copy.sort(
                Comparator.comparing(PlannerEvent::getDay)
                        .thenComparing(PlannerEvent::getStartTime)
        );
        this.nodes = copy.toArray(new PlannerEvent[]{});

        /*
         Populate the local arrays for movie ids and event scores.
         For PlannerEvents that have no movie ID (e.g. OtherActivities),
         a surrogate unique movie ID will be generated.

        */
        Random r = new Random();
        Map<Long, Integer> movieMap = new HashMap<>();

        // store which movie id corresponds to the i-th element
        // of the adjacency matrix
        this.nodes_movie_id = new int[this.nodes.length];
        // same for the score of the session.
        this.nodes_score = new long[this.nodes.length];

        int movie_index = 0;
        for (int i=0; i< nodes.length; i++){
           PlannerEvent event = nodes[i];
           Long movieId = event.getMovie();
           if (movieId == null){
               // Generate a surrogate ID, hoping that no collision occurs.
               // We pick these surrogate ID in the negative range to limit
               // the risk of collision with the other events.
               movieId = (long) (r.nextInt(7999) - 8000);
           }
           if (movieMap.containsKey(movieId)){
               // Note: here we coerce a long to an int.
               // In practice this is manageable because there is not
               // *that* many movies planned at a given instance of
               // the festival!
               this.nodes_movie_id[i] = movieMap.get(movieId);
           }
           else{
               movieMap.put(movieId, movie_index);
               this.nodes_movie_id[i] = movie_index;
               movie_index++;
           }

           this.nodes_score[i] = event.getScore();
        }
    }

    private void initEdges(){
        adjacency = new int[nodes.length][nodes.length];
        for (int iSrc = 0; iSrc < nodes.length; iSrc++){
            for (int iDst = iSrc+1; iDst < nodes.length; iDst++){
                PlannerEvent src = nodes[iSrc];
                PlannerEvent dst = nodes[iDst];
                if (! src.isTransitionFeasible(dst)) continue;
                adjacency[iSrc][iDst] = 1;
            }
        }
    }

    public long countPaths(){
        long[] nodepaths = new long[nodes.length];
        nodepaths[nodes.length -1] = 1L;
        for (int j=nodes.length-1; j>=0; j--){
            for (int i= j+1; i < nodes.length; i++){
                if (adjacency[j][i] == 1){
                    nodepaths[j] += nodepaths[i];
                }
            }
        }
        return nodepaths[0];
    }

    // ******************* Computation ************************

    @Override
    public List<PlannerEvent> findBestRoadmap(){
        List<PlannerEvent> best = explore();
        // remove the ROOT
        return best.subList(1, best.size());
    }

    // CAUTION : very un-java code below
    private List<PlannerEvent> explore(){
        int[] nodesStack = new int[nodes.length];
        int[] edgesStack = new int[nodes.length];
        int stackTop = 0;
        long currentScore = 0L;


        int[] bestPath = new int[nodes.length];
        long bestScore = Long.MIN_VALUE;
        int saveTop = 0;

        // Values in that array are :
        // - true if the movie at this index has already been seen
        //   in the path currently examined,
        // - false otherwise.
        boolean[] seenMovies = new boolean[nodes_movie_id.length];

        // init with the ROOT node (index 0 by construction)
        nodesStack[stackTop] = 0;
        edgesStack[stackTop] = 1;
        currentScore += nodes_score[0];
        seenMovies[nodes_movie_id[0]] = true;

        // loop variables
        int iSrc;
        int iDest;

        /*
         Note: keep in mind that here the code does a depth-first
         exploration, and is logically recursive. However, in practice
         the recursion implementation has been linearized using a stack
         etc.

         Thus, when the top loop (labelled "nodeloop") resumes,
         it is usually with a different node of the graph than
         the iteration before!
        */
        nodeloop: while(stackTop >= 0){
            // restore the state
            iSrc = nodesStack[stackTop];
            iDest = edgesStack[stackTop];

            // edges exploration, except the SINK (last position)
            while (iDest < nodes.length - 1) {

                // Skip if no edge or if movie already seen,
                // and this test is well worth the branch prediction miss penalty.
                if (adjacency[iSrc][iDest] == 0 || seenMovies[nodes_movie_id[iDest]]) {
                    iDest++;
                    continue;
                }

                // Else, "dest" is eligible for exploration
                // first, we save what will be the next "dest" to explore
                // from this "src" node, once the stack unwinds to this point.
                edgesStack[stackTop] = iDest+1;

                // now we push things in stack and go explore"dest" node
                stackTop++;
                nodesStack[stackTop] = iDest;
                edgesStack[stackTop] = iDest + 1;
                // TODO : never decremented, or tracked with a stack. To me it keeps
                // increasing forever. Bug ?
                currentScore += nodes_score[iDest];
                seenMovies[nodes_movie_id[iDest]] = true;

                // now that the stacks are ready, break
                // the main while loop will pop and the processing
                // will resume at the next node.
                continue nodeloop;
            }

            /*
             We exit this loop once we reach the SINK, because the SINK is by construction the
             last node. So we can evaluate the value of the roadmap. At this stage we know
             the path is a valid path (no conflict, and each movie seen at most once).

             If that path is better, we save the score and the path.

             This block of code replace the
             "if (this == SINK)" condition tested in
             other variants of this code.
            */

            if (currentScore > bestScore){
                bestScore = currentScore;
                System.arraycopy(nodesStack, 0, bestPath, 0, stackTop+1);
                saveTop = stackTop;
            }

            // if we have finished exploring that node
            // we pop the stacks
            stackTop--;
            seenMovies[nodes_movie_id[iSrc]] = false;
            currentScore -= nodes_score[iSrc];
        }

        // collect the result events.
        List<PlannerEvent> result = new ArrayList<>( saveTop);
        for (int i=0; i<=  saveTop; i++){
            result.add(nodes[bestPath[i]]);
        }

        return result;

    }


}



