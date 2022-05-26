package org.bsiri.gegerator.config;


import lombok.Data;

/**
 * General settings that will tweak the behavior of the wizard,
 * in addition to the user choices regarding MovieRating and
 * EventRating.
 *
 * These settings are adjustable by the user from the UI.
 */
@Data
public class WizardConfiguration {

    private TheaterRating espaceLacRating = TheaterRating.DEFAULT;
    private TheaterRating casinoRating = TheaterRating.DEFAULT;
    private TheaterRating paradisoRating = TheaterRating.DEFAULT;
    private TheaterRating mclRating = TheaterRating.DEFAULT;

    /**
     * A bias that will make the wizard give overall more importance
     * to the rating of the movies, or to the ratings of the theaters.
     *
     * The scale is:
     * - 0.0 : MovieRating is paramount and the TheaterRating is irrelevant
     * - 1.0 : The reverse situation
     * - 0.5 : Both are of equal importance (this is the default).
     */
    private float movieVsTheaterCoeff = 0.5f;


    public void setMovieVsTheaterCoeff(float movieVsTheaterCoeff) {
        if (movieVsTheaterCoeff < 0.0f || movieVsTheaterCoeff > 1.00f){
            throw new IllegalArgumentException(
                    "movieVsTheaterCoeff out of scale ! Should be between [0.0, 1.0] but got : " +
                    movieVsTheaterCoeff
            );
        }
        this.movieVsTheaterCoeff = movieVsTheaterCoeff;
    }
}
