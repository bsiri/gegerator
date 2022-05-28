package org.bsiri.gegerator.graph;

import org.bsiri.gegerator.config.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;

public class EventGraph {

    private static Long ROOT_MOVIE = -9999L;
    private static Long SINK_MOVIE = -9998L;

    private static final EventNode ROOT = new EventNode(
            null,
            "ROOT",
            0,
            ROOT_MOVIE,
            null,
            DayOfWeek.WEDNESDAY,
            LocalTime.of(0, 1),
            LocalTime.of(0,2)
    );

    private static final EventNode SINK = new EventNode(
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
    private EventNode[] events;

    /* The value for each entry is 1 if a connection
     * is possible and 0 otherwise.
     * The first axis is the index of the source event,
     * the second axis is for the destination event.
     *
     * Since we assume that the events are sorted chronologically
     * (see remarks above), this matrix will be quasi-diagonal).
     */
    private int[][] adjacency;

    public EventGraph(Collection<EventNode> evts){
       initNodes(evts);
       initEdges();
    }

    // ************** Initialization *****************

    private void initNodes(Collection<EventNode> orig){
        List<EventNode> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        copy.add(SINK);
        Collections.sort(copy, Comparator.comparing(EventNode::getDay).thenComparing(EventNode::getStartTime));
        this.events = copy.toArray(new EventNode[]{});
    }

    private void initEdges(){
        adjacency = new int[events.length][events.length];
        for (int iSrc = 0; iSrc < events.length; iSrc++){
            for (int iDst = iSrc+1; iDst < events.length; iDst++){
                EventNode src = events[iSrc];
                EventNode dst = events[iDst];
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

    public List<EventNode> findBestRoadmap(){
        ExplorationStack stack = new ExplorationStack(events.length);

        // Note : node 0 is the ROOT node
        stack.push(events[0]);
        explore(0, stack);
        List<EventNode> best = Arrays.asList(stack.bestRoadmap);
        stack.pop();

        // remove the ROOT and SINK nodes then exit
        return best.subList(1, best.size()-1);
    }

    private void explore(int nodeIndex, ExplorationStack stack){
        EventNode node = events[nodeIndex];
        if (node == SINK){
            stack.recordRoadmapIfBest();
            return;
        }
        for (int destIndex = nodeIndex+1; destIndex < events.length; destIndex++){
            EventNode destNode = events[destIndex];

            if (adjacency[nodeIndex][destIndex] == 0 ) continue;
            if (stack.alreadySeenMovie(destNode)) continue;

            stack.push(destNode);
            explore(destIndex, stack);
            stack.pop();
        }
    }

    // ******************* Helper classes *********************

    private static final class ExplorationStack{
        private EventNode[] nodeStack;
        private int topStack = 0;

        // We also need to keep track of movies that has
        // already been seen
        private Set<Long> seenMovies = new HashSet<>();

        // keep track of score
        private long bestScore = -10000;
        private EventNode[] bestRoadmap;

        ExplorationStack(int nodesCard){
            nodeStack = new EventNode[nodesCard];
        }

        void push(EventNode node){
            nodeStack[topStack++]=node;
            if (node.getMovie() != null){
                seenMovies.add(node.getMovie());
            }
        }

        EventNode pop(){
            EventNode node = nodeStack[--topStack];
            if (node.getMovie() != null){
                seenMovies.remove(node.getMovie());
            }
            return node;
        }

        boolean alreadySeenMovie(EventNode node){
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
                bestRoadmap = new EventNode[topStack];
                System.arraycopy(nodeStack, 0, bestRoadmap, 0, topStack);
            }
        }

    }

}



