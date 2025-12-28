package org.bsiri.gegerator.planner;

import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.domain.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.Comparator;


public interface TimeAndSpaceLocation {
    /**
     * Returns the Theater, if any. I mean, it can legitimately return null.
     * @return
     */
    Theater getTheater();

    // the rest is non null.
    DayOfWeek getDay();
    LocalTime getStartTime();
    LocalTime getEndTime();

    default boolean isBefore(TimeAndSpaceLocation other){
        int dayDiff = this.getDay().compareTo(other.getDay());
        if (dayDiff != 0){
            return dayDiff < 0;
        }
        return this.getStartTime().compareTo(other.getStartTime()) < 0;

    }
    /**
     * Test that:
     * - the events are not overlapping,
     * - it is timely feasible to walk to the other TimeAndSpaceLocation and still
     * arrive before it starts.
     *
     * Formally : does the end time of this event + the travel time to the other, is
     * still less that the start time of the other ?
     *
     * @return
     */
    default boolean isTransitionFeasible(TimeAndSpaceLocation other){
        // First, check that this event actually happens first.
        int dayDiff = this.getDay().compareTo(other.getDay());
        if (dayDiff != 0){
            return dayDiff < 0;
        }
        //if (other.isBefore(this)) return false;

        // Bugfix : to handle cases of late movies and time arithmetic issues that arise around
        // midnight, here we "clock back" by 2 hours the times so that we have no problems.
        // Other solution : using LocalDateTime instead of mere LocalTime ?
        LocalTime thisEndTime = this.getEndTime().minus(Duration.ofMinutes(120));
        LocalTime otherStartTime = other.getStartTime().minus(Duration.ofMinutes(120));

        Duration travel = TheaterDistanceTravel.get(this.getTheater(), other.getTheater());
        return thisEndTime.plus(travel).isBefore(otherStartTime);
    }

    /**
     * An overlap means that the end time of the earliest TASL happens after the
     * start time of the latest, accounting for the travel time. See doc of
     * #isTransitionFeasible for detail.
     *
     * @param
     * @return
     */
    public static boolean overlap(TimeAndSpaceLocation tasl1, TimeAndSpaceLocation tasl2){
        TimeAndSpaceLocation first = tasl1;
        TimeAndSpaceLocation second = tasl2;
        if (! first.isBefore(second)){
            first = tasl2;
            second = tasl1;
        }
        return ! first.isTransitionFeasible(second);
    }


}
