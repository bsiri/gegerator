package org.bsiri.gegerator.planner;


import org.bsiri.gegerator.domain.TheaterDistanceTravel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;

/*
    This variant aims at getting rid of as much
    recursion as possible in method 'explore'
 */
public class IterativeGraphPlanner implements WizardPlanner {

    private static final Logger LOGGER = LoggerFactory.getLogger(IterativeGraphPlanner.class);

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

    public IterativeGraphPlanner(Collection<PlannerEvent> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<PlannerEvent> orig){
        List<PlannerEvent> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        copy.add(SINK);
        Collections.sort(copy, Comparator.comparing(PlannerEvent::getDay).thenComparing(PlannerEvent::getStartTime));
        this.nodes = copy.toArray(new PlannerEvent[]{});
    }

    private void initEdges(){
        // TODO : test with JMH if generating only
        // an array of exactly size = card(outbound edges)
        // could be faster for larger graphs : it would cost
        // time with all the mallocs involved initially,
        // but this could save time at exploration time
        // since the graph is rather sparse.
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
        List<PlannerEvent> best = rexplore();
        // remove the ROOT and SINK nodes then exit
        return best.subList(1, best.size()-1);
    }


    private void explore(int nodeIndex, ExplorationStack stack){
        PlannerEvent node = nodes[nodeIndex];
        if (node == SINK){
            stack.recordRoadmapIfBest();
            return;
        }
        for (int destIndex = nodeIndex+1; destIndex < nodes.length; destIndex++){
            PlannerEvent destNode = nodes[destIndex];

            if (adjacency[nodeIndex][destIndex] == 0 ) continue;
            if (stack.alreadySeenMovie(destNode)) continue;

            stack.push(destNode);
            explore(destIndex, stack);
            stack.pop();
        }
    }

    // still DFS style though
    // CAUTION : this is insane
    private List<PlannerEvent> rexplore(){
        int[] srcNodesStack = new int[nodes.length];
        int srcNodesTop = 0;

        int[] lastExploredDestNodesStack = new int[nodes.length];
        int lastexploredTop = 0;

        int bestRoadmap[] = new int[nodes.length];
        int roadmapTop = 0;
        long bestScore = Long.MIN_VALUE;

        Set<Long> seenMovies = new HashSet<>();

        int iSrc;
        int iDest;

        // init with the ROOT node
        srcNodesStack[srcNodesTop] = 0;
        lastExploredDestNodesStack[lastexploredTop] = 1;
        seenMovies.add(ROOT.getMovie());

        while(srcNodesTop >= 0){
            // pop the nodestack
            iSrc = srcNodesStack[srcNodesTop];
            PlannerEvent src = nodes[iSrc];
            iDest = lastExploredDestNodesStack[lastexploredTop];

            LOGGER.info("resuming exploration from node {}, next explored : {}", iSrc, iDest);

            // Terminal condition
            if (src == SINK){
                // record the best roadmap
                long score = 0;
                for (int i=0; i<=srcNodesTop; i++){
                    score += nodes[srcNodesStack[i]].getScore();
                }

                LOGGER.info("found the sink, score is {}", score);
                List<Integer> path = new ArrayList<>();
                for (int i=0; i<=srcNodesTop; i++){
                    path.add(srcNodesStack[i]);
                }
                LOGGER.info("path is {}", path);

                if (score > bestScore){
                    bestScore = score;
                    LOGGER.info("new score is better, keeping path");
                    System.arraycopy(srcNodesStack, 0, bestRoadmap, 0, srcNodesTop+1);
                    roadmapTop = srcNodesTop;
                }

                // pop
                srcNodesTop--;
                lastexploredTop--;
                if (seenMovies.contains(src.getMovie())) seenMovies.remove(src.getMovie());

                continue;
            }
            else {
                // edges exploration
                while (iDest < nodes.length) {
                    PlannerEvent dest = nodes[iDest];

                    // skip if no edge or if movie already seen
                    if (adjacency[iSrc][iDest] == 0 || seenMovies.contains(dest.getMovie())) {
                        LOGGER.info("{}->{} : no path, or movie already seen", iSrc, iDest);
                        iDest++;
                        continue;
                    }

                    // else, "dest" is elligible for exploration
                    // first, we save what will be the next dest to explore
                    // from this src node.
                    lastExploredDestNodesStack[lastexploredTop] = iDest+1;

                    // now we push things in stack and go explore next node
                    LOGGER.info("exploring node {}", iDest);
                    srcNodesStack[++srcNodesTop] = iDest;
                    lastExploredDestNodesStack[++lastexploredTop] = iDest + 1;
                    if (dest.getMovie() != null) seenMovies.add(dest.getMovie());


                    // now that the stacks are ready, break
                    // the main while loop will pop and the processing
                    // will resume at the next node.
                    break;
                }

                // if we have finished exploring that node
                // we pop the stacks
                if (iDest == nodes.length){
                    LOGGER.info("Done exploring node {}", iSrc);
                    srcNodesTop--;
                    lastexploredTop--;
                    if (seenMovies.contains(src.getMovie())) seenMovies.remove(src.getMovie());
                }
            }

        }

        List<PlannerEvent> result = new ArrayList<>(roadmapTop);
        for (int i=0; i<= roadmapTop; i++){
            result.add(nodes[bestRoadmap[i]]);
        }

        return result;

    }

    // ******************* Helper classes *********************

    private static final class ExplorationStack{
        private PlannerEvent[] nodeStack;
        private int topStack = 0;

        // We also need to keep track of movies that has
        // already been seen
        private Set<Long> seenMovies = new HashSet<>();

        // keep track of score
        private long bestScore = Long.MIN_VALUE;
        private PlannerEvent[] bestRoadmap;

        ExplorationStack(int nodesCard){
            nodeStack = new PlannerEvent[nodesCard];
        }

        void push(PlannerEvent node){
            nodeStack[topStack++]=node;
            if (node.getMovie() != null){
                seenMovies.add(node.getMovie());
            }
        }

        PlannerEvent pop(){
            PlannerEvent node = nodeStack[--topStack];
            if (node.getMovie() != null){
                seenMovies.remove(node.getMovie());
            }
            return node;
        }

        boolean alreadySeenMovie(PlannerEvent node){
            return seenMovies.contains(node.getMovie());
        }

        void recordRoadmapIfBest(){
            // the good old for loop will be more efficient,
            // because a stream over a native array will just iterate
            // until the end of it instead of stopping at "topstack'
            long currentScore = 0L;
            for (int i=0; i<topStack; i++)
                currentScore += nodeStack[i].getScore();

            if (currentScore > bestScore){
                bestScore = currentScore;
                bestRoadmap = new PlannerEvent[topStack];

                System.arraycopy(nodeStack, 0, bestRoadmap, 0, topStack);
            }
        }

    }

}



