package org.bsiri.gegerator.domain;

/**
 * Represents an event that have an EventRating
 */
public interface RatableEvent {
    EventRating getRating();
}
