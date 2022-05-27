package org.bsiri.gegerator.graph;

import org.bsiri.gegerator.config.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.*;

public class EventGraph {

    private static final GraphNode ROOT = new GraphNode(
            null,
            "ROOT",
            null,
            DayOfWeek.WEDNESDAY,
            LocalTime.of(0, 1),
            LocalTime.of(0,2),
            0
    );


    private GraphNode[] events;
    private int adjacency[][];

    public EventGraph(Collection<GraphNode> events){
        this.events = sortedEvents(events);
        initialize();
    }

    private void initialize(){
        adjacency = new int[events.length][events.length];
        for (GraphNode src : events){
            for (GraphNode dest: events){
                // #FUCK : NPE with the root node here
                Duration travel = TheaterDistanceTravel.get(src.getRepresentedEvent(), dest.getRepresentedEvent());
                if (src.getEndTime().compareTo(dest.getStartTime().plus(travel)) < 0){
                    // #FUCK : what's the index of the Event ?
                }
            }
        }
    }

    private GraphNode[] sortedEvents(Collection<GraphNode> orig){
        List<GraphNode> copy = new ArrayList<>(orig);
        copy.add(ROOT);
        Collections.sort(copy, Comparator.comparing(GraphNode::getDay).thenComparing(GraphNode::getStartTime));
        return copy.toArray(new GraphNode[]{});
    }


}
