package org.bsiri.gegerator.services.planner;

import lombok.Value;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieRating;
import org.bsiri.gegerator.domain.Theater;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;

public class PlannerEventHelper {


    /**
     * A simplified builder for PlannerEvents, intended to simplify the creation of events.
     *
     * The required parameters are :
     * - name,
     * - score,
     * - movieId (nullable),
     * - tasSpec (TimeAndSpaceSpecification), see below.
     *
     * #########
     * TimeAndSpaceSpecification format :
     *
     * It is a string which encodes informations for the theater, day, start time and end time.
     * The general format is as follow :
     *
     * `THEATER or empty | DAY | start:time | end:time`
     *
     * The separator is pipe '|'. Spaces are optional but can be added for clarity.
     *
     * - THEATER is the name of the enum value for the Theater where the event will happen (if it
     * is a movie session). If there is no theater (eg for OtherActivities), you can leave it empty
     * but you still need to add a pipe '|'.
     *
     * - DAY is the same, for the enum DayOfWeek. Unlike the above, it cannot be empty
     *
     * - start:time and end:time are strings that encodes time as hh:mm (hours 2 digits, minutes 2 digits).
     *
     *
     * @param name
     * @param score
     * @param movieId
     * @param tasSpec
     * @return
     */
    public static PlannerEvent event(
            String name,
            long score,
            Long movieId,
            String tasSpec
    ){
        TimeAndSpaceLocation tas = parseTimeAndSpaceLocationSpec(tasSpec);
        return new PlannerEvent(
                null,
                name,
                score,
                movieId,
                tas.getTheater(),
                tas.getDay(),
                tas.getStartTime(),
                tas.getEndTime()
        );
    }

    /**
     * Parse the data for a TimeAndSpaceLocation with this format :
     * THEATER or empty | DAY | start:time | end:time
     * @param sessionSpec
     * @return
     */
    static private TimeAndSpaceLocation parseTimeAndSpaceLocationSpec(String sessionSpec){
        String[] expr = sessionSpec.split("\\|");

        Theater theater = expr[0].trim().equals("") ? null : Theater.valueOf(expr[0].trim());

        return new SimpleTimeAndSpaceLocation(
                theater,
                DayOfWeek.valueOf(expr[1].trim()),
                time(expr[2].trim()),
                time(expr[3].trim())
        );
    }

    /**
     * Parse the data for a Movie with this format:
     * id | title | hours:minutes
     * @param movieSpec
     * @return
     */
    static private Movie parseMovieSpec(String movieSpec){
        String[] expr = movieSpec.split("|");
        return Movie.of(
                Long.parseLong(expr[0].trim()),
                expr[1].trim(),
                duration(expr[2].trim()),
                MovieRating.DEFAULT
        );
    }

    static private LocalTime time(String asString){
        return LocalTime.parse(asString+":00");
    }

    static private Duration duration(String asString){
        String[] sp = asString.split(":");
        long minutes = 60*Integer.parseInt(sp[0]) + Integer.parseInt(sp[1]);
        return Duration.ofMinutes(minutes);
    }

    @Value
    private static final class SimpleTimeAndSpaceLocation implements TimeAndSpaceLocation{
        Theater theater;
        DayOfWeek day;
        LocalTime startTime;
        LocalTime endTime;
    }

}
