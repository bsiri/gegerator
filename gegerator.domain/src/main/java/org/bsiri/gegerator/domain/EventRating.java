package org.bsiri.gegerator.domain;

/**
 * Enum that represent how important is
 * a given MovieSession.
 * The details of how Movie and MovieSession
 * ratings compose with each other
 * depend on the planning algorithm.
 */
public enum EventRating {
    /**
     * Mandatory rating : the MovieSession is a must
     * and any optimal planning should include this
     * particular MovieSession
     */
    MANDATORY,

    /**
     * Default rating : this is the default rating;
     * this MovieSession has no particular value
     * compared to others. This is the default
     * rating.
     */
    DEFAULT,

    /**
     * Never rating : this MovieSession will never
     * be planned.
     */
    NEVER;
}
