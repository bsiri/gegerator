package org.bsiri.gegerator.domain;

import java.time.DayOfWeek;
import java.time.LocalTime;

public interface PlannableEvent {
    DayOfWeek getDay();
    LocalTime getStartTime();
}
