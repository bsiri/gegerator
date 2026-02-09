package org.bsiri.gegerator.planner;

import lombok.Value;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieRating;
import org.bsiri.gegerator.domain.Theater;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.time.temporal.Temporal;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.DuplicateFormatFlagsException;
import java.util.List;
import java.util.Random;
import java.util.stream.IntStream;

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

    /**
     * Generates a random grid of the given size with the following score probabilities:
     * - [7000 to 10000] : 15%
     * - [1000 to 6999] : 25%
     * - 0 : 50%
     * - [-1000 to -10000] : the rest (10%)
     *
     * Day is equiprobable.
     * Duration of events is between 50m and 120m.
     * Start time is between 08h00 and 20h00.
     * Movie ids are equiprobable.
     * Theaters are equiprobable.
     *
     *
     * This is not quite realistic (in reality sessions tend to be grouped by batches starting
     * roughly at the same time for example), but still provide a good smoke test.
     *
     * Note: use a fixed seed for reproducibility of the result.
     * @param size: the size of the grid
     * @return
     */

    static final List<PlannerEvent> randomGrid(int size){
        List<PlannerEvent> result = new ArrayList<>();
        Random rand = new Random(0);

        // setup
        var alldays = new DayOfWeek[]{ DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY};
        var alltheaters = Theater.values();
        var maxMovie = (int)(size/1.6);
        var allMovieIds = IntStream.range(0, maxMovie).toArray();
        // minstartime 8:00 maxstarttime 21:40
        var minstarttime = 480;
        var maxstarttime = 1300;
        // minduration: 50m, max duration: 120m
        var minduration = 50;
        var maxduration = 120;

        for (int i=0; i<size; i++){
            var day = alldays[(rand.nextInt(alldays.length))];
            var theater = alltheaters[(rand.nextInt(alltheaters.length))];
            var startminutes = rand.nextInt(minstarttime, maxstarttime);
            var durationminutes = rand.nextInt(minduration, maxduration);

            var selScore = rand.nextFloat();
            var score = (selScore<0.15) ? rand.nextInt(7000, 10000):
                    (selScore < 0.4) ? rand.nextInt(1000, 6999) :
                    (selScore < 0.90) ? 0 :
                    rand.nextInt(-10000, -1000);

            var selMovie = rand.nextFloat();
            var movieId = allMovieIds[rand.nextInt(0, maxMovie)];

            var hourStart = startminutes / 60;
            var minStart = startminutes % 60;
            var startTime = LocalTime.of(hourStart, minStart);

            var endTime = startTime.plusMinutes(durationminutes);

            var event = new PlannerEvent(null,
                    "event #"+i,
                    score,
                    (long) movieId,
                    theater,
                    day,
                    startTime,
                    endTime
                    );
            result.add(event);
        }
        return result;

    }
}
