package org.bsiri.gegerator.config;

/**
 * Represents the general opinion regarding Theaters and how
 * much it could be an incentive to go to a particular MovieSession
 * if planned in that Theater (or not).
 *
 */
public enum TheaterRating {

    /**
     * This Theater is particularly attractive.
     */
    HIGHEST,

    /**
     * This Theater is a good pick.
     */
    HIGH,

    /**
     * Nothing special about that Theater.
     */
    DEFAULT,

    /**
     * Never consider sessions planned in that Theater.
     */
    NEVER;
}
