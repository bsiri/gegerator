package org.bsiri.gegerator.planner.exactplanners;

import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.planner.FestivalDatasets;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.PlannerEventHelper;
import org.bsiri.gegerator.planner.exoticplanners.BlobPlanner;
import org.bsiri.gegerator.planner.exoticplanners.CopilotPlanner;
import org.bsiri.gegerator.planner.graphplanners.IterativeGraphPlannerV2;
import org.bsiri.gegerator.planner.graphplanners.RankedPathGraphPlanner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.bsiri.gegerator.planner.FestivalDatasets.findInconsistency;
import static org.bsiri.gegerator.planner.FestivalDatasets.totalScore;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class BranchAndBoundPlannerTest {

    /*
     * The timing target is 2 seconds on a modest hardware. The assertions
     * below are much stricter than that because in practice the planner
     * needs a few milliseconds : if one of them fails, something went wrong.
     */
    private static final Duration TIME_LIMIT = Duration.ofMillis(500);

    /**
     * On small grids, the score must be the same as the one
     * found by the exhaustive search.
     */
    @Test
    public void shouldFindTheSameScoreAsTheExhaustiveSearch() {
        for (int seed = 0; seed < 300; seed++) {
            int size = 10 + seed % 14;
            List<PlannerEvent> events = switch (seed % 3) {
                case 0 -> PlannerEventHelper.randomGrid(size, seed, 1 + seed % 2);
                case 1 -> FestivalDatasets.generate(seed, 1 + seed % 2, size);
                default -> FestivalDatasets.generateUnrated(seed, 1, size);
            };

            long expected = totalScore(new IterativeGraphPlannerV2(events).findBestRoadmap());

            BranchAndBoundPlanner planner = new BranchAndBoundPlanner(events);
            List<PlannerEvent> roadmap = planner.findBestRoadmap();

            assertNull(findInconsistency(roadmap), "seed " + seed);
            assertEquals(expected, totalScore(roadmap), "seed " + seed);
            assertTrue(planner.isOptimal(), "seed " + seed);
        }
    }

    /**
     * The actual grids of the past festivals: the roadmap must be valid, proven
     * optimal, found quickly, and at least as good as what the other planners find.
     */
    @ParameterizedTest
    @ValueSource(strings = {
            FestivalDatasets.GEGE_2020,
            FestivalDatasets.GEGE_2023_UNRATED,
            FestivalDatasets.GEGE_2023,
            FestivalDatasets.GEGE_2026
    })
    public void shouldSolveActualFestivals(String sample) {
        List<PlannerEvent> events = FestivalDatasets.load(sample);

        BranchAndBoundPlanner planner = new BranchAndBoundPlanner(events);
        List<PlannerEvent> roadmap = assertTimeout(TIME_LIMIT, planner::findBestRoadmap);
        long score = totalScore(roadmap);

        assertFalse(roadmap.isEmpty());
        assertNull(findInconsistency(roadmap));
        assertTrue(planner.isOptimal());
        assertTrue(roadmap.stream().allMatch(event -> event.getScore() > 0));

        assertTrue(score >= totalScore(new RankedPathGraphPlanner(events).findBestRoadmap()));
        assertTrue(score >= totalScore(new CopilotPlanner(events).findBestRoadmap()));
        assertTrue(score >= totalScore(new BlobPlanner(events).findBestRoadmap()));
    }

    /**
     * Generated grids, from the size of the current festival up to
     * a festival three times larger that would last the whole week.
     */
    @ParameterizedTest
    @CsvSource({
            "5, 100",
            "5, 120",
            "6, 150",
            "7, 300"
    })
    public void shouldSolveLargerFestivals(int nbDays, int nbSessions) {
        for (int seed = 0; seed < 10; seed++) {
            for (boolean rated : new boolean[]{true, false}) {
                List<PlannerEvent> events = rated ?
                        FestivalDatasets.generate(seed, nbDays, nbSessions) :
                        FestivalDatasets.generateUnrated(seed, nbDays, nbSessions);

                BranchAndBoundPlanner planner = new BranchAndBoundPlanner(events);
                List<PlannerEvent> roadmap = assertTimeout(TIME_LIMIT, planner::findBestRoadmap);

                String context = String.format("seed %d, rated %s", seed, rated);
                assertNull(findInconsistency(roadmap), context);
                assertTrue(planner.isOptimal(), context);
                assertTrue(totalScore(roadmap) >= totalScore(new CopilotPlanner(events).findBestRoadmap()), context);
            }
        }
    }

    /**
     * When the time budget is too short to complete the search, the planner
     * still returns a valid, decent roadmap, and says it is not proven optimal.
     */
    @Test
    public void shouldReturnAValidRoadmapWhenOutOfTime() {
        // a grid deliberately hard : huge, all scores are equal, and each movie has ten sessions
        Random rand = new Random(8);
        List<PlannerEvent> events = new ArrayList<>();
        for (int i = 0; i < 500; i++) {
            LocalTime startTime = LocalTime.of(8, 0).plusMinutes(rand.nextInt(820));
            events.add(new PlannerEvent(null, "event #" + i, 10, (long) rand.nextInt(50),
                    Theater.values()[rand.nextInt(4)], DayOfWeek.of(3 + rand.nextInt(5)),
                    startTime, startTime.plusMinutes(50 + rand.nextInt(70))));
        }

        // sanity check : given enough time, the search does need more than a few nodes
        BranchAndBoundPlanner patient = new BranchAndBoundPlanner(events, Duration.ofSeconds(30));
        long optimum = totalScore(patient.findBestRoadmap());
        assumeTrue(patient.getExploredNodes() > 50);

        BranchAndBoundPlanner planner = new BranchAndBoundPlanner(events, Duration.ZERO);
        List<PlannerEvent> roadmap = planner.findBestRoadmap();

        assertFalse(planner.isOptimal());
        assertFalse(roadmap.isEmpty());
        assertNull(findInconsistency(roadmap));
        // 'decent' : within 10% of the optimum
        assertTrue(totalScore(roadmap) >= 0.9 * optimum);
    }

    @Test
    public void shouldPlanNothingWhenNothingIsWorthIt() {
        List<PlannerEvent> events = List.of(
                PlannerEventHelper.event("awful", -1000, 1L, "MCL | FRIDAY | 10:00 | 11:00"),
                PlannerEventHelper.event("pointless", 0, 2L, "MCL | SATURDAY | 10:00 | 11:00")
        );
        assertTrue(new BranchAndBoundPlanner(events).findBestRoadmap().isEmpty());
        assertTrue(new BranchAndBoundPlanner(List.of()).findBestRoadmap().isEmpty());
    }
}
