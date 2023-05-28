package org.bsiri.gegerator.planner;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.bsiri.gegerator.domain.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter(AccessLevel.PACKAGE)
@AllArgsConstructor
public class PlannerEvent implements TimeAndSpaceLocation {
    private PlannableEvent representedEvent;
    private String name;
    private long score;

    /**
     * Movie Id (may be null if it represents an OtherActivity)
     */
    private Long movie;

    /**
     * Theater (may be null if represents an OtherActivity)
     */
    private Theater theater;

    private DayOfWeek day;
    private LocalTime startTime;
    private LocalTime endTime;

    @Override
    public String toString(){
        return name;
    }

    public static PlannerEvent of(MovieSession session, Movie movie, int score){
        return new PlannerEvent(
                session,
                String.format("%s - %s - %s - %s",
                        session.getDay(),
                        session.getStartTime(),
                        session.getTheater(),
                        movie.getTitle()
                ),
                score,
                movie.getId(),
                session.getTheater(),
                session.getDay(),
                session.getStartTime(),
                session.getStartTime().plus(movie.getDuration())
        );
    }

    public static PlannerEvent of(OtherActivity activity, int score){
        return new PlannerEvent(
                activity,
                String.format("%s - %s - %s",
                        activity.getDay(),
                        activity.getStartTime(),
                        activity.getDescription()
                ),
                score,
                null,
                null,
                activity.getDay(),
                activity.getStartTime(),
                activity.getEndTime()
        );
    }


}
