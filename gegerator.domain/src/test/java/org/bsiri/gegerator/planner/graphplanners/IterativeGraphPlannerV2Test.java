package org.bsiri.gegerator.planner.graphplanners;


import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;
import org.bsiri.gegerator.planner.graphplanners.IterativeGraphPlannerV2;
import org.bsiri.gegerator.planner.graphplanners.RankedPathGraphPlanner;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.bsiri.gegerator.planner.PlannerEventHelper.event;

public class IterativeGraphPlannerV2Test {

    static private Long NO_MOVIE = null;
    static private Long MOVIE_1 = 1L;
    static private Long MOVIE_2 = 2L;
    static private Long MOVIE_3 = 3L;
    static private Long MOVIE_4 = 4L;

    static private long OUTSTANDING_SCORE = 100000;
    static private long SUPER_SCORE = 1000;
    static private long MEDIUM_SCORE = 500;
    static private long AVERAGE_SCORE = 10;
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
        List<PlannerEvent> nodes = Arrays.asList(
            event("Movie 2 Average", AVERAGE_SCORE, MOVIE_2, "MCL|THURSDAY|10:00|11:00"),
            event("Movie 1 Super", SUPER_SCORE, MOVIE_1, "PARADISO|THURSDAY|10:00|11:00"),
            event("Movie 2 Super", SUPER_SCORE, MOVIE_2, "PARADISO|FRIDAY|10:00|11:00"),
            event("Movie 1 Average", AVERAGE_SCORE, MOVIE_1, "PARADISO|FRIDAY|10:00|11:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner graph = new IterativeGraphPlannerV2(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("Movie 1 Super", "Movie 2 Super"));

    }

    /**
     * In this scenario,
     * a same movie is planned three times.
     * The expected result is that it is planned only once in the roadmap,
     * with the best score possible.
     */
    @Test
    public void shouldNotPlanSameMovieTwice(){
        List<PlannerEvent> nodes = Arrays.asList(
            event("average session", AVERAGE_SCORE, MOVIE_1, "MCL | THURSDAY | 10:00 | 11:00"),
            event("super session", SUPER_SCORE, MOVIE_1, "MCL | FRIDAY | 10:00 | 11:00"),
            event("medium session", MEDIUM_SCORE, MOVIE_1, "MCL | SUNDAY | 10:00 | 11:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner graph = new IterativeGraphPlannerV2(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("super session"));
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
        List<PlannerEvent> nodes = Arrays.asList(
            event("super movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
            event("another super movie", SUPER_SCORE, MOVIE_2, "CASINO | FRIDAY | 10:30 | 11:30"),
            event("average movie", AVERAGE_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 11:15 | 12:15")
        );
        Collections.shuffle(nodes);

        WizardPlanner graph = new IterativeGraphPlannerV2(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("super movie", "average movie"));
    }


    /**
     * In this scenario, the graph detects that one cannot possibly
     * move fast enough to watch both movies, so it picks only the
     * best one.
     */
    @Test
    public void shouldNoticeBothMoviesNotPossible(){
        List<PlannerEvent> nodes = Arrays.asList(
            event("average movie", AVERAGE_SCORE, MOVIE_2, "MCL | THURSDAY | 10:00 | 11:00"),
            event("best movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | THURSDAY | 11:05 | 12:05")
        );
        Collections.shuffle(nodes);

        WizardPlanner graph = new IterativeGraphPlannerV2(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("best movie"));
    }


    /**
     * BUG 1 : events starting at the same time don't precedes
     * nor follows each other !
     */
    @Test
    public void shouldNotPlanBothSessions(){
        List<PlannerEvent> nodes = Arrays.asList(
                event("movie 2 super", SUPER_SCORE, MOVIE_2, "ESPACE_LAC | THURSDAY | 22:00 | 23:48"),
                event("movie 1 super", SUPER_SCORE, MOVIE_1, "PARADISO | THURSDAY | 22:00 | 23:30")
        );
        //Collections.shuffle(nodes);

        WizardPlanner graph = new RankedPathGraphPlanner(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        MatcherAssert.assertThat(best.size(), Matchers.equalTo(1));
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
        List<PlannerEvent> nodes = Arrays.asList(
                // THURSDAY
                event("movie 1 awfull", AWFUL_SCORE, MOVIE_1, "PARADISO | THURSDAY | 08:00 | 09:00"),
                event("movie 2 super", SUPER_SCORE, MOVIE_2, "ESPACE_LAC | THURSDAY | 10:00 | 11:00"),
                event("movie 3 medium", MEDIUM_SCORE, MOVIE_3, "CASINO | THURSDAY | 12:00 | 13:00"),
                event("movie 4 average", AVERAGE_SCORE, MOVIE_4, "MCL | THURSDAY | 14:00 | 15:00"),

                // FRIDAY
                event("movie 2 awfull", AWFUL_SCORE, MOVIE_2, "PARADISO | FRIDAY | 08:00 | 09:00"),
                event("movie 3 super", SUPER_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
                event("movie 4 medium", MEDIUM_SCORE, MOVIE_4, "CASINO | FRIDAY | 12:00 | 13:00"),
                event("movie 1 average", AVERAGE_SCORE, MOVIE_1, "MCL | FRIDAY | 14:00 | 15:00"),

                // SATURDAY + RESTAURANT
                event("movie 3 awfull", AWFUL_SCORE, MOVIE_3, "PARADISO | SATURDAY | 08:00 | 09:00"),
                event("movie 4 super", SUPER_SCORE, MOVIE_4, "ESPACE_LAC | SATURDAY | 10:00 | 11:00"),
                event("restaurant", OUTSTANDING_SCORE, NO_MOVIE, "| SATURDAY | 10:30 | 11:30"),
                event("movie 1 medium", MEDIUM_SCORE, MOVIE_1, "CASINO | SATURDAY | 12:00 | 13:00"),
                event("movie 2 average", AVERAGE_SCORE, MOVIE_2, "MCL | SATURDAY | 14:00 | 15:00"),

                // SUNDAY
                event("movie 4 awfull", AWFUL_SCORE, MOVIE_4, "PARADISO | SUNDAY | 08:00 | 09:00"),
                event("movie 1 super", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | SUNDAY | 10:00 | 11:00"),
                event("movie 2 medium", MEDIUM_SCORE, MOVIE_2, "CASINO | SUNDAY | 12:00 | 13:00"),
                event("movie 3 average", AVERAGE_SCORE, MOVIE_3, "MCL | SUNDAY | 14:00 | 15:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner graph = new IterativeGraphPlannerV2(nodes);
        List<PlannerEvent> best = graph.findBestRoadmap();

        System.out.println(((IterativeGraphPlannerV2)graph).countPaths());

        MatcherAssert.assertThat(collectNames(best), Matchers.contains(
                "movie 2 super",
                "movie 3 super",
                "movie 4 medium",
                "restaurant",
                "movie 1 super"
        ));

    }


    // *********** Helpers *************

    private List<String> collectNames(List<PlannerEvent> nodes){
        return nodes.stream().map(PlannerEvent::getName).collect(Collectors.toList());
    }
}
