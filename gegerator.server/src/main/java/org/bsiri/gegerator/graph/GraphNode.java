package org.bsiri.gegerator.graph;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.PlannableEvent;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class GraphNode {
    private PlannableEvent representedEvent;
    private String name;
    private Movie movie;
    private DayOfWeek day;
    private LocalTime startTime;
    private LocalTime endTime;
    private int score;
}
