package org.bsiri.gegerator.planner;

import org.bsiri.gegerator.domain.Theater;

import java.time.DayOfWeek;
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
}
