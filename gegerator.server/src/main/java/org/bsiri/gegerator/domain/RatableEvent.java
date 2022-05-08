package org.bsiri.gegerator.domain;

import java.time.LocalTime;

/**
 * Represents an event that have an EventRating
 */
public interface RatableEvent {
    EventRating getRating();
}
