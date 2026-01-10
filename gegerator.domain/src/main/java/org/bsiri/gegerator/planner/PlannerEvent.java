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
                /*
                 FIXME: here we assign a Long because we have to (the Planner
                  expects one), but it does not represent a Movie.
                    Here we use a surrogate ID instead.
                    Using minus (activity.getId() works fine for our purpose:
                    - no conflict with movie ids (no movie id is negative),
                    - no conflict with other activities (per definition of an OtherActivity id)
                  Still this is semantically sloppy.
                */
                - activity.getId(),
                null,
                activity.getDay(),
                activity.getStartTime(),
                activity.getEndTime()
        );
    }


}
