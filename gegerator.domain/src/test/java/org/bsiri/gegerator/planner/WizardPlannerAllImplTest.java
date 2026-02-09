package org.bsiri.gegerator.planner;

import org.bsiri.gegerator.planner.copilot.CopilotPlanner;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.bsiri.gegerator.planner.PlannerEventHelper.event;


/**
 * Class that runs the same tests for all our implementations, on
 * various scenarios.
 *
 */
public class WizardPlannerAllImplTest {

    static private Long SURROGATE_ID_1 = -1L;
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
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldPlanBestScores(String plannerName, PlannerProvider plannerProvider){
        List<PlannerEvent> nodes = Arrays.asList(
            event("Movie 2 Average", AVERAGE_SCORE, MOVIE_2, "MCL|THURSDAY|10:00|11:00"),
            event("Movie 1 Super", SUPER_SCORE, MOVIE_1, "PARADISO|THURSDAY|10:00|11:00"),
            event("Movie 2 Super", SUPER_SCORE, MOVIE_2, "PARADISO|FRIDAY|10:00|11:00"),
            event("Movie 1 Average", AVERAGE_SCORE, MOVIE_1, "PARADISO|FRIDAY|10:00|11:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("Movie 1 Super", "Movie 2 Super"));

    }

    /**
     * In this scenario,
     * a same movie is planned three times.
     * The expected result is that it is planned only once in the roadmap,
     * with the best score possible.
     */
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldNotPlanSameMovieTwice(String plannerName, PlannerProvider plannerProvider){
        List<PlannerEvent> nodes = Arrays.asList(
            event("average session", AVERAGE_SCORE, MOVIE_1, "MCL | THURSDAY | 10:00 | 11:00"),
            event("super session", SUPER_SCORE, MOVIE_1, "MCL | FRIDAY | 10:00 | 11:00"),
            event("medium session", MEDIUM_SCORE, MOVIE_1, "MCL | SUNDAY | 10:00 | 11:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("super session"));
    }


    /**
     * In this scenario:
     * - a super movie first,
     * - another super movie then,
     * - an average movie third
     *
     * these movies slightly overlap with each other,
     * and eventually the planner picks the one and third
     * because it's better than nothing.
     */
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldSacrificeAMovie(String plannerName, PlannerProvider plannerProvider){
        List<PlannerEvent> nodes = Arrays.asList(
            event("super movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | FRIDAY | 10:00 | 11:00"),
            event("another super movie", SUPER_SCORE, MOVIE_2, "CASINO | FRIDAY | 10:30 | 11:30"),
            event("average movie", AVERAGE_SCORE, MOVIE_3, "ESPACE_LAC | FRIDAY | 11:15 | 12:15")
        );
        Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("super movie", "average movie"));
    }


    /**
     * In this scenario, the planner detects that one cannot possibly
     * move fast enough to watch both movies, so it picks only the
     * best one.
     */
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldNoticeBothMoviesNotPossible(String plannerName, PlannerProvider plannerProvider){
        List<PlannerEvent> nodes = Arrays.asList(
            event("average movie", AVERAGE_SCORE, MOVIE_2, "MCL | THURSDAY | 10:00 | 11:00"),
            event("best movie", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | THURSDAY | 11:05 | 12:05")
        );
        Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains("best movie"));
    }

    /**
     * BUG 1 : events starting at the same time don't precedes
     * nor follows each other !
     */
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldNotPlanBothSessions(String plannerName, PlannerProvider plannerProvider){
        List<PlannerEvent> nodes = Arrays.asList(
                event("movie 2 super", SUPER_SCORE, MOVIE_2, "ESPACE_LAC | THURSDAY | 22:00 | 23:48"),
                event("movie 1 super", SUPER_SCORE, MOVIE_1, "PARADISO | THURSDAY | 22:00 | 23:30")
        );
        //Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(best.size(), Matchers.equalTo(1));
    }

    /**
     * In this scenario :
     * - four movies are planned, four times (once for each score),
     * - plus a restaurant,
     * - three movies are picked at their best score,
     * - the fourth at its not-so-best score because of timing constraints
     *
     * @return
     */
    @ParameterizedTest
    @MethodSource("enumeratePlanners")
    public void shouldMakeCompromisesAndPlanTheRestaurant(String plannerName, PlannerProvider plannerProvider){
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
                event("restaurant", OUTSTANDING_SCORE, SURROGATE_ID_1, "| SATURDAY | 10:30 | 11:30"),
                event("movie 1 medium", MEDIUM_SCORE, MOVIE_1, "CASINO | SATURDAY | 12:00 | 13:00"),
                event("movie 2 average", AVERAGE_SCORE, MOVIE_2, "MCL | SATURDAY | 14:00 | 15:00"),

                // SUNDAY
                event("movie 4 awfull", AWFUL_SCORE, MOVIE_4, "PARADISO | SUNDAY | 08:00 | 09:00"),
                event("movie 1 super", SUPER_SCORE, MOVIE_1, "ESPACE_LAC | SUNDAY | 10:00 | 11:00"),
                event("movie 2 medium", MEDIUM_SCORE, MOVIE_2, "CASINO | SUNDAY | 12:00 | 13:00"),
                event("movie 3 average", AVERAGE_SCORE, MOVIE_3, "MCL | SUNDAY | 14:00 | 15:00")
        );
        Collections.shuffle(nodes);

        WizardPlanner planner = plannerProvider.create(nodes);
        List<PlannerEvent> best = planner.findBestRoadmap();

        MatcherAssert.assertThat(collectNames(best), Matchers.contains(
                "movie 2 super",
                "movie 3 super",
                "movie 4 medium",
                "restaurant",
                "movie 1 super"
        ));

    }

    /**
     * In this scenario :
     * - lots of everything are planned
     * - the goal is just to return a result before the timeout
     *
     * Note: it is important to schedule here only fast planners !
     * @return
     */
    @ParameterizedTest
    @MethodSource("enumerateFastPlanners")
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    public void shouldCompleteBeforeTimeout(String plannerName, PlannerProvider plannerProvider) {
        // Running the planner in a separate thread because otherwise the @Timeout
        // will never CPU time to trigger
        try {
            Callable<List<PlannerEvent>> plannertask = () -> {
                var grid = PlannerEventHelper.randomGrid(100);
                WizardPlanner planner = plannerProvider.create(grid);
                return planner.findBestRoadmap();
            };

            var task = new FutureTask<>(plannertask);
            var thread = new Thread(task);
            thread.start();
            var result = task.get();
            // dummy assertion
            Assertions.assertFalse(result.isEmpty());
        }
        catch (Exception ex){
            Assertions.fail("shouldCompleteBeforeTimeout thrown an exception : "+ex.getMessage());
        }
    }


    // *********** Helpers *************

    private List<String> collectNames(List<PlannerEvent> nodes){
        return nodes.stream().map(PlannerEvent::getName).collect(Collectors.toList());
    }

    public interface PlannerProvider {
        WizardPlanner create(List<PlannerEvent> events);
    }

    private static Stream<Arguments> enumeratePlanners() {
        return Stream.of(
                Arguments.of(
                        CopilotPlanner.class.getSimpleName(),
                        (PlannerProvider) CopilotPlanner::new
                )
        );
    }

    private static Stream<Arguments> enumerateFastPlanners() {
        return Stream.of(
                Arguments.of(
                        CopilotPlanner.class.getSimpleName(),
                        (PlannerProvider) CopilotPlanner::new
                )
        );
    }
}
