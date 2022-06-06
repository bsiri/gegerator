package org.bsiri.gegerator.planner;


import org.bsiri.gegerator.domain.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.LongStream;

/*
    Iterative Planner was rather crappy because of too many branch miss,
    so in this one we attempt to reduce the number of branches as well.
 */
public class IterativeGraphPlannerV2 implements WizardPlanner {


    private static Long ROOT_MOVIE = -9999L;
    private static Long SINK_MOVIE = -9998L;

    private static final PlannerEvent ROOT = new PlannerEvent(
            null,
            "ROOT",
            0,
            ROOT_MOVIE,
            null,
            DayOfWeek.WEDNESDAY,
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
     * Since our edges are modeled by an adjacency matrix (and not
     * a proper Edge object), this allows us to shortcut a good amount
     * of loop iterations * instead of exploring the whole N²
     * combinations.
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

    public IterativeGraphPlannerV2(Collection<PlannerEvent> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<PlannerEvent> orig){
        List<PlannerEvent> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        copy.add(SINK);

        // assign a pseudo movie to events that have none
        // (typically, events that correspond to OtherActivities)
        // This will help with eliminating all the nullchecks on movies
        PrimitiveIterator.OfLong idStream = LongStream.iterate(-8000L, l -> l+1).iterator();
        copy.stream().filter(e -> e.getMovie() == null)
                .collect(Collectors.toList())
                .forEach(e -> e.setMovie(idStream.next()));

        // sort by date then return
        Collections.sort(copy, Comparator.comparing(PlannerEvent::getDay).thenComparing(PlannerEvent::getStartTime));
        this.nodes = copy.toArray(new PlannerEvent[]{});
    }

    private void initEdges(){
        adjacency = new int[nodes.length][nodes.length];
        for (int iSrc = 0; iSrc < nodes.length; iSrc++){
            for (int iDst = iSrc+1; iDst < nodes.length; iDst++){
                PlannerEvent src = nodes[iSrc];
                PlannerEvent dst = nodes[iDst];
                if (! isTransitionFeasible(src, dst)) continue;
                adjacency[iSrc][iDst] = 1;
            }
        }
    }

    /**
     * Test whether if the start time of event 'dst' is after the endtime of 'src',
     * while also accounting for external factors such as travel time.
     *
     * @param src
     * @param dst
     * @return
     */
    private boolean isTransitionFeasible(TimeAndSpaceLocation src, TimeAndSpaceLocation dst){
        int dayDiff = src.getDay().compareTo(dst.getDay());
        if (dayDiff != 0){
            return (dayDiff < 0);
        }
        Duration travel = TheaterDistanceTravel.get(src.getTheater(), dst.getTheater());
        return src.getEndTime().plus(travel).isBefore(dst.getStartTime());
    }

    // ******************* Computation ************************

    @Override
    public List<PlannerEvent> findBestRoadmap(){
        List<PlannerEvent> best = explore();
        // remove the ROOT
        return best.subList(1, best.size());
    }



    // CAUTION : this is insane
    private List<PlannerEvent> explore(){
        /*
            TODO : try the following, one after the other

            - just find a better algorithm

            - store the score and the movies in arrays, so
            we can spare us some lookups

            - try replace the set of seenMovies with a
            array of flags that we can then test by
            direct access.
            (this requires to re-number the movies)
            (test in micro JMH benchmark first)

            - eliminate every autoboxing I see

            - compute the score along the way (maintain
            it in yet another stack) instead of recomputing
            everytime a loop hits the SINK

            - try reintroducing the concept of day scope
            (see DailyGraphPlanner)

            - try to use shorts instead of ints, with luck
            it will help maintain arrays in caches closer
            to CPU - quite a random thing to test by why not

            - if it work, re-scale the scoring system so
            that the total score can be an int

            - cache lines in L1 are 64 bytes long. How
            could I make my data fit in this ?

         */


        int[] nodesStack = new int[nodes.length];
        int[] edgesStack = new int[nodes.length];
        int stackTop = 0;


        int saveStack[] = new int[nodes.length];
        int saveTop = 0;
        long bestScore = Long.MIN_VALUE;

        Set<Long> seenMovies = new HashSet<>(nodes.length);

        int iSrc;
        int iDest;

        // init with the ROOT node
        nodesStack[stackTop] = 0;
        edgesStack[stackTop] = 1;
        seenMovies.add(ROOT.getMovie());

        nodeloop: while(stackTop >= 0){
            // restore the state
            iSrc = nodesStack[stackTop];
            PlannerEvent src = nodes[iSrc];
            iDest = edgesStack[stackTop];

            // edges exploration, except the SINK (last position)
            while (iDest < nodes.length - 1) {
                PlannerEvent dest = nodes[iDest];

                // skip if no edge or if movie already seen
                if (adjacency[iSrc][iDest] == 0 || seenMovies.contains(dest.getMovie())) {
                    iDest++;
                    continue;
                }

                // else, "dest" is eligible for exploration
                // first, we save what will be the next dest to explore
                // from this src node.
                edgesStack[stackTop] = iDest+1;

                // now we push things in stack and go explore next node
                stackTop++;
                nodesStack[stackTop] = iDest;
                edgesStack[stackTop] = iDest + 1;

                seenMovies.add(dest.getMovie());


                // now that the stacks are ready, break
                // the main while loop will pop and the processing
                // will resume at the next node.
                continue nodeloop;
            }

            // we exit this loop once we reach the SINK,
            // because the SINK is by construction the
            // last node. So we can evaluate the value
            // of the roadmap.
            // This block of code replace the
            // "if (this == SINK)" condition tested in
            // other variants
            long score = 0;
            for (int i=0; i<=stackTop; i++){
                score += nodes[nodesStack[i]].getScore();
            }
            if (score > bestScore){
                bestScore = score;
                System.arraycopy(nodesStack, 0, saveStack, 0, stackTop+1);
                saveTop = stackTop;
            }

            // if we have finished exploring that node
            // we pop the stacks
            stackTop--;
            seenMovies.remove(src.getMovie());

        }

        List<PlannerEvent> result = new ArrayList<>( saveTop);
        for (int i=0; i<=  saveTop; i++){
            result.add(nodes[saveStack[i]]);
        }

        return result;

    }


}



