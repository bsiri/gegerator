package org.bsiri.gegerator.graph;


import lombok.Value;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieRating;
import org.bsiri.gegerator.domain.Theater;
import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.*;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class GraphTest {

    static private Long NO_MOVIE = null;
    static private Long MOVIE_1 = 1L;
    static private Long MOVIE_2 = 2L;
    static private Long MOVIE_3 = 3L;
    static private Long MOVIE_4 = 4L;

    static private long OUTSTANDING_SCORE = 100000;
    static private long SUPER_SCORE = 1000;
    static private long MEDIUM_SCORE = 500;
    static private long AVERAGE_SCORE = 0;
    static private long AWFUL_SCORE = -1000;


    /**
     * Here the scenario is :
     * - two movies, planned twice,
     * - once with an average score, and once with a super score
     * - sessions are programmed at the sames times
     *
     * The expected result is that session with super scores are
     * planned, and are consistent chronologically.
     */
    @Test
    public void shouldPlanBestScores(){
        List<EventNode> nodes = Arrays.asList(
            node("Movie 2 Average", AVERAGE_SCORE, MOVIE_2, "MCL|THURSDAY|10:00|11:00"),
            node("Movie 2 Super", SUPER_SCORE, MOVIE_2, "PARADISO|FRIDAY|10:00|11:00"),
            node("Movie 1 Super", SUPER_SCORE, MOVIE_1, "PARADISO|THURSDAY|10:00|11:00"),
            node("Movie 1 Average", AVERAGE_SCORE, MOVIE_1, "PARADISO|FRIDAY|10:00|11:00")
        );
        Collections.shuffle(nodes);

        EventGraph graph = new EventGraph(nodes);
        List<EventNode> best = graph.findBestRoadmap();

        assertThat(collectNames(best), contains("Movie 1 Super", "Movie 2 Super"));

    }

    /**
     * In this scenario,
     * a same movie is planned three times.
     * The expected result is that it is planned only once in the roadmap,
     * with the best score possible.
     */
    @Test
    public void shouldNotPlanSameMovieTwice(){
        List<EventNode> nodes = Arrays.asList(
            node("average session", AVERAGE_SCORE, MOVIE_1, "MCL | THURSDAY | 10:00 | 11:00"),
            node("super session", SUPER_SCORE, MOVIE_1, "MCL | FRIDAY | 10:00 | 11:00"),
            node("medium session", MEDIUM_SCORE, MOVIE_1, "MCL | SUNDAY | 10:00 | 11:00")
        );
        Collections.shuffle(nodes);

        EventGraph graph = new EventGraph(nodes);
        List<EventNode> best = graph.findBestRoadmap();

        assertThat(collectNames(best), contains("super session"));
    }


    /**
     * In this scenario:
     * - a super movie first,
     * - another super movie then,
     * - an average movie third
     *
     * these movies slightly overlap with each other,
     * and eventually the graph picks the one and third
     * because it's better than nothing.
     */
    @Test
    public void shouldSacrificeAMovie(){
        List<EventNode> nodes = Arrays.asList(
            node("super movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
            node("another super movie", SUPER_SCORE, MOVIE_2, "CASINO | FRIDAY | 10:30 | 11:30"),
            node("average movie", AVERAGE_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 11:15 | 12:15")
        );
        Collections.shuffle(nodes);

        EventGraph graph = new EventGraph(nodes);
        List<EventNode> best = graph.findBestRoadmap();

        assertThat(collectNames(best), contains("super movie", "average movie"));
    }


    /**
     * In this scenario, the graph detects that one cannot possibly
     * move fast enough to watch both movies, so it picks only the
     * best one.
     */
    @Test
    public void shouldNoticeBothMoviesNotPossible(){
        List<EventNode> nodes = Arrays.asList(
            node("average movie", AVERAGE_SCORE, MOVIE_2, "MCL | THURSDAY | 10:00 | 11:00"),
            node("best movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | THURSDAY | 11:05 | 12:05")
        );
        Collections.shuffle(nodes);

        EventGraph graph = new EventGraph(nodes);
        List<EventNode> best = graph.findBestRoadmap();

        assertThat(collectNames(best), contains("best movie"));
    }


    /**
     * In this scenario :
     * - four movies are planned, four times (once for each score),
     * - plus a restaurant,
     * - three movies are picked at their best score,
     * - the fourth at its next best score because of timing constraints
     *
     * @return
     */
    @Test
    public void shouldMakeCompromisesAndPlanTheRestaurant(){
        List<EventNode> nodes = Arrays.asList(
                // THURSDAY
                node("movie 1 awfull", AWFUL_SCORE, MOVIE_1, "PARADISO | THURSDAY | 08:00 | 09:00"),
                node("movie 2 super", SUPER_SCORE, MOVIE_2, "ESPACE_LAC | THURSDAY | 10:00 | 11:00"),
                node("movie 3 medium", MEDIUM_SCORE, MOVIE_3, "CASINO | THURSDAY | 12:00 | 13:00"),
                node("movie 4 average", AVERAGE_SCORE, MOVIE_4, "MCL | THURSDAY | 14:00 | 15:00"),

                // FRIDAY
                node("movie 2 awfull", AWFUL_SCORE, MOVIE_2, "PARADISO | FRIDAY | 08:00 | 09:00"),
                node("movie 3 super", SUPER_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
                node("movie 4 medium", MEDIUM_SCORE, MOVIE_4, "CASINO | FRIDAY | 12:00 | 13:00"),
                node("movie 1 average", AVERAGE_SCORE, MOVIE_1, "MCL | FRIDAY | 14:00 | 15:00"),

                // SATURDAY + RESTAURANT
                node("movie 3 awfull", AWFUL_SCORE, MOVIE_3, "PARADISO | SATURDAY | 08:00 | 09:00"),
                node("movie 4 super", SUPER_SCORE, MOVIE_4, "ESPACE_LAC | SATURDAY | 10:00 | 11:00"),
                node("restaurant", OUTSTANDING_SCORE, NO_MOVIE, "| SATURDAY | 10:30 | 11:30"),
                node("movie 1 medium", MEDIUM_SCORE, MOVIE_1, "CASINO | SATURDAY | 12:00 | 13:00"),
                node("movie 2 average", AVERAGE_SCORE, MOVIE_2, "MCL | SATURDAY | 14:00 | 15:00"),

                // SUNDAY
                node("movie 4 awfull", AWFUL_SCORE, MOVIE_4, "PARADISO | SUNDAY | 08:00 | 09:00"),
                node("movie 1 super", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | SUNDAY | 10:00 | 11:00"),
                node("movie 2 medium", MEDIUM_SCORE, MOVIE_2, "CASINO | SUNDAY | 12:00 | 13:00"),
                node("movie 3 average", AVERAGE_SCORE, MOVIE_3, "MCL | SUNDAY | 14:00 | 15:00")
        );
        Collections.shuffle(nodes);

        EventGraph graph = new EventGraph(nodes);
        List<EventNode> best = graph.findBestRoadmap();

        assertThat(collectNames(best), contains(
                "movie 2 super",
                "movie 3 super",
                "movie 4 medium",
                "restaurant",
                "movie 1 super"
        ));

    }


    // *********** Events builder functions *************

    private List<String> collectNames(List<EventNode> nodes){
        return nodes.stream().map(EventNode::getName).collect(Collectors.toList());
    }


    private EventNode node(
        String name,
        long score,
        Long movieId,
        String tasSpec
    ){
        TimeAndSpaceLocation tas = parseTimeAndSpaceLocationSpec(tasSpec);
        return new EventNode(
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
    private TimeAndSpaceLocation parseTimeAndSpaceLocationSpec(String sessionSpec){
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
    private Movie parseMovieSpec(String movieSpec){
        String[] expr = movieSpec.split("|");
        return Movie.of(
            Long.parseLong(expr[0].trim()),
            expr[1].trim(),
            duration(expr[2].trim()),
            MovieRating.DEFAULT
        );
    }

    private LocalTime time(String asString){
        return LocalTime.parse(asString+":00");
    }

    private Duration duration(String asString){
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
