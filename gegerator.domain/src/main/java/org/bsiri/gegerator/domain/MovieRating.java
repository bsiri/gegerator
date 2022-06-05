package org.bsiri.gegerator.domain;

/**
 * Represents how important is a Movie.
 * The details of how Movie and MovieSession
 * ratings compose with each other
 * depend on the planning algorithm.
 *
 */
public enum MovieRating {
    /**
     * As much as possible, try to plan
     * this movie in any session.
     */
    HIGHEST,

    /**
     * These are the next most important
     * movies to see.
     */
    HIGH,

    /**
     * This movie is nice to have but not
     * of particular importance.
     */
    DEFAULT,

    /**
     * Never plan this movie.
     */
    NEVER;
}
