package org.bsiri.gegerator.planner;

import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.domain.TheaterDistanceTravel;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;


interface TimeAndSpaceLocation {
    /**
     * Returns the Theater, if any. I mean, it can legitimately return null.
     * @return
     */
    Theater getTheater();

    // the rest is non null.
    DayOfWeek getDay();
    LocalTime getStartTime();
    LocalTime getEndTime();

    /**
     * Says whether it is timely feasible to walk to the other TimeAndSpaceLocation
     * in time.
     *
     * That is, whether when this TASL ends, can we arrive at the other TASL before
     * it starts.
     *
     * @return
     */
    default boolean isTransitionFeasible(TimeAndSpaceLocation other){
        int dayDiff = this.getDay().compareTo(other.getDay());
        if (dayDiff != 0){
            return (dayDiff < 0);
        }
        // Bugfix : to handle cases of late movies and time arithmetic issues that arise around
        // midnight, here we "clock back" by 2 hours the times so that we have no problems.
        // Other solution : using LocalDateTime instead of mere LocalTime ?
        LocalTime thisEndTime = this.getEndTime().minus(Duration.ofMinutes(120));
        LocalTime otherStartTime = other.getStartTime().minus(Duration.ofMinutes(120));

        Duration travel = TheaterDistanceTravel.get(this.getTheater(), other.getTheater());
        return thisEndTime.plus(travel).isBefore(otherStartTime);
    }

}
