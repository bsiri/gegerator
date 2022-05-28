package org.bsiri.gegerator.graph;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.bsiri.gegerator.domain.PlannableEvent;
import org.bsiri.gegerator.domain.Theater;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class EventNode implements TimeAndSpaceLocation {
    private PlannableEvent representedEvent;
    private String name;
    private long score;

    /**
     * Movie Id, may be null
     */
    private Long movie;

    /**
     * Theater, may be null
     */
    private Theater theater;

    private DayOfWeek day;
    private LocalTime startTime;
    private LocalTime endTime;
}
