package org.bsiri.gegerator.planner;


import org.bsiri.gegerator.domain.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * An attempt of optimizing the NaiveGraphPlanner. Improvements include :
 *
 * - Reducing the overall connectivity by scoping the connectivity between sessions day by day,
 *   instead of global connectivity; ie a session on friday no longer has direct edges on sessions
 *   in saturday and sunday.
 *
 */
public class DailyGraphPlanner implements WizardPlanner {

    private static final PlannerEvent ROOT = specialNode(
            "ROOT",
            -9999L,
            DayOfWeek.THURSDAY,
            LocalTime.of(4,1),
            LocalTime.of(4,2));


    private static final PlannerEvent THURDSAY_END = specialNode(
            "THURDAY_END",
            -9998L,
            DayOfWeek.FRIDAY,
            LocalTime.of(4,1),
            LocalTime.of(4,2));

    private static final PlannerEvent FRIDAY_END = specialNode(
            "FRIDAY_END",
            -9997L,
            DayOfWeek.SATURDAY,
            LocalTime.of(4,1),
            LocalTime.of(4,2));

    private static final PlannerEvent SATUDAY_END = specialNode(
            "SATUDAY_END",
            -9996L,
            DayOfWeek.SUNDAY,
            LocalTime.of(4,1),
            LocalTime.of(4,2));

    private static final PlannerEvent SINK = specialNode(
            "SINK",
            -9995L,
            DayOfWeek.SUNDAY,
            LocalTime.of(23,58),
            LocalTime.of(23,59)
    );

    private static final Set<PlannerEvent> specialNodes;

    static {
        specialNodes = new HashSet<>();
        specialNodes.add(ROOT);
        specialNodes.add(THURDSAY_END);
        specialNodes.add(FRIDAY_END);
        specialNodes.add(SATUDAY_END);
        specialNodes.add(SINK);
    }

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
     *
     * The introduction of special nodes such as THURSDAY_END are
     * also a way at reducing the overall connectivity
     * (see below)
     */
    private PlannerEvent[] nodes;

    /* The value for each entry is 1 if a connection
     * is possible and 0 otherwise.
     * The first axis is the index of the source event,
     * the second axis is for the destination event.
     *
     * Unlike in NaiveGraphPlanner, we cut the connectivity
     * by removing edges from vertices from different days.
     * One can see it as clustering the vertices by days. We
     * do so by introducing special nodes like THURDSAY_END,
     * which is the sink of all edges for events of Thursday
     * and the root of all edges for events in Friday.
     */
    private int[][] adjacency;

    public DailyGraphPlanner(Collection<PlannerEvent> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<PlannerEvent> orig){
        List<PlannerEvent> copy = new ArrayList<>(orig);
        copy.addAll(specialNodes);
        Collections.sort(copy, Comparator.comparing(PlannerEvent::getDay).thenComparing(PlannerEvent::getStartTime));
        this.nodes = copy.toArray(new PlannerEvent[]{});
    }

    private void initEdges(){
        int[] outboundVertices = new int[nodes.length];
        int nbOutbound = 0;

        adjacency = new int[nodes.length][];
        for (int iSrc = 0; iSrc < nodes.length; iSrc++){
            PlannerEvent src = nodes[iSrc];
            nbOutbound = 0;
            for (int iDst = iSrc+1; iDst < nodes.length; iDst++){
                PlannerEvent dst = nodes[iDst];
                if (dst.getDay() != src.getDay()) {
                    // Day transition here :
                    // dst is the special node that indicates the end
                    // of the day. Indeed, here it is technically
                    // implemented as the first event of the next day,
                    // see definition
                    outboundVertices[nbOutbound++] = iDst;
                    break;
                };
                if (! isTransitionFeasible(src, dst)) continue;
                outboundVertices[nbOutbound++] = iDst;
            }
            adjacency[iSrc] = new int[nbOutbound];
            System.arraycopy(outboundVertices, 0, adjacency[iSrc], 0, nbOutbound);
        }
    }

    /**
     * Test whether if the start time of event 'dst' is after the endtime of 'src',
     * while also accounting for external factors such as travel time.
     *
     * Days are not compared and are assumed to be the same.
     * @param src
     * @param dst
     * @return
     */
    private boolean isTransitionFeasible(TimeAndSpaceLocation src, TimeAndSpaceLocation dst){
        Duration travel = TheaterDistanceTravel.get(src.getTheater(), dst.getTheater());
        return src.getEndTime().plus(travel).isBefore(dst.getStartTime());
    }

    // ******************* Computation ************************

    @Override
    public List<PlannerEvent> findBestRoadmap(){
        ExplorationStack stack = new ExplorationStack(nodes.length);

        // Note : node 0 is the ROOT node
        stack.push(nodes[0]);
        explore(0, stack);
        stack.pop();
        List<PlannerEvent> best = Arrays.asList(stack.bestRoadmap);

        // remove the special nodes then exit
        return best.stream().filter(e -> ! specialNodes.contains(e)).collect(Collectors.toList());
    }

    private void explore(int nodeIndex, ExplorationStack stack){
        PlannerEvent node = nodes[nodeIndex];
        if (node == SINK){
            stack.recordRoadmapIfBest();
            return;
        }
        for (int edgeIndex = 0; edgeIndex < adjacency[nodeIndex].length; edgeIndex++){

            int destIndex = adjacency[nodeIndex][edgeIndex];

            PlannerEvent destNode = nodes[destIndex];
            if (stack.alreadySeenMovie(destNode)) continue;

            stack.push(destNode);
            explore(destIndex, stack);
            stack.pop();
        }
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


    // ************ other builders/helper ******************


    private static final PlannerEvent specialNode(
            String nodeName,
            Long pseudoMovieId,
            DayOfWeek day,
            LocalTime startTime,
            LocalTime endTime){
        return new PlannerEvent(
                null,
                nodeName,
                0,
                pseudoMovieId,
                null,
                day,
                startTime,
                endTime
        );
    }


}



