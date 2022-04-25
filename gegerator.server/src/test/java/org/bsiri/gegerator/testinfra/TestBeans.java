package org.bsiri.gegerator.testinfra;

import org.bsiri.gegerator.domain.*;

import static java.time.Duration.ofMinutes;
import static java.time.LocalTime.parse;

/**
 * The beans here can be used for various tests, but their
 * ID are specifically tailored after the dataset
 * "resources/datasets/appstate-service/appstate.sql
 */
public class TestBeans {

    private TestBeans() {
    }

    // ********* movies **********

    public static Movie decapitron() {
        return Movie.of(1L, "Decapitron", ofMinutes(96), MovieRating.DEFAULT);
    }

    public static Movie tremors() {
        return Movie.of(2L, "Tremors", ofMinutes(96), MovieRating.HIGH);
    }

    public static Movie halloween() {
        return Movie.of(3L, "Halloween", ofMinutes(91), MovieRating.HIGHEST);
    }

    public static Movie theMist(){
        return Movie.of(4L, "The Mist", ofMinutes(126), MovieRating.DEFAULT);
    }

    // ********** sessions **********

    public static MovieSession thursdayDecapitron() {
        return MovieSession.of(1L, decapitron().getId(), Theater.ESPACE_LAC, Day.THURSDAY, parse("10:00:00"), MovieSessionRating.NEVER);
    }

    public static MovieSession saturdayDecapitron() {
        return MovieSession.of(2L, decapitron().getId(), Theater.MCL, Day.SATURDAY, parse("17:25:00"), MovieSessionRating.DEFAULT);
    }

    public static MovieSession sundayHalloween() {
        return MovieSession.of(3L, halloween().getId(), Theater.CASINO, Day.SUNDAY, parse("11:15:00"), MovieSessionRating.DEFAULT);
    }

    public static MovieSession fridayTremors() {
        return MovieSession.of(4L, tremors().getId(), Theater.PARADISO, Day.FRIDAY, parse("13:30:00"), MovieSessionRating.MANDATORY);
    }

    // ********** activities *********

    public static OtherActivity thursdayGeromoise() {
        return OtherActivity.of(1L, Day.THURSDAY, parse("19:00:00"), parse("21:00:00"), "Géromoise");
    }

    public static OtherActivity saturdaySoupeAuChoux() {
        return OtherActivity.of(2L, Day.SATURDAY, parse("20:00:00"), parse("21:30:00"), "Soupe aux Choux");
    }

}
