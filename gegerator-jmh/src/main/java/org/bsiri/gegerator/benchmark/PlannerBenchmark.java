package org.bsiri.gegerator.benchmark;


import org.bsiri.gegerator.planner.FestivalDatasets;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.exactplanners.BranchAndBoundPlanner;
import org.bsiri.gegerator.planner.deprecated.BlobPlanner;
import org.bsiri.gegerator.planner.deprecated.CopilotPlanner;
import org.bsiri.gegerator.planner.deprecated.RankedPathGraphPlanner;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Compares the planners that are fast enough to be used for real, on
 * the actual grids of the past festivals and on generated, larger grids.
 *
 * The grids are the same from one run to the other, so the results are comparable.
 */
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MICROSECONDS)
@Warmup(iterations = 2, time = 2)
@Measurement(iterations = 3, time = 1)
@Timeout(time = 11)
@Fork(1)
public class PlannerBenchmark {

    @State(Scope.Benchmark)
    public static class Grid {

        /*
         * Either the name of a sample (see FestivalDatasets), or the spec
         * of a generated grid : (rated|unrated)-(nb days)d-(nb sessions)
         */
        @Param({
                "gege_2020.json",
                "gege_2023.2.json",
                "gege_2023.3.final.json",
                "gege_2026.json",
                "rated-5d-120",
                "unrated-5d-120",
                "rated-6d-150",
                "unrated-6d-150",
                "rated-7d-300",
                "unrated-7d-300"
        })
        String grid;

        List<PlannerEvent> events;

        @Setup(Level.Trial)
        public void loadEvents() {
            if (grid.endsWith(".json")) {
                events = FestivalDatasets.load(grid);
                return;
            }
            String[] spec = grid.split("-");
            int nbDays = Integer.parseInt(spec[1].replace("d", ""));
            int nbSessions = Integer.parseInt(spec[2]);
            events = spec[0].equals("rated") ?
                    FestivalDatasets.generate(1, nbDays, nbSessions) :
                    FestivalDatasets.generateUnrated(1, nbDays, nbSessions);
        }
    }

    @Benchmark
    public List<PlannerEvent> benchBranchAndBoundPlanner(Grid grid) {
        return new BranchAndBoundPlanner(grid.events).findBestRoadmap();
    }

    @Benchmark
    public List<PlannerEvent> benchRankedPathGraphPlanner(Grid grid) {
        return new RankedPathGraphPlanner(grid.events).findBestRoadmap();
    }

    @Benchmark
    public List<PlannerEvent> benchBlobPlanner(Grid grid) {
        return new BlobPlanner(grid.events).findBestRoadmap();
    }

    @Benchmark
    public List<PlannerEvent> benchCopilotPlanner(Grid grid) {
        return new CopilotPlanner(grid.events).findBestRoadmap();
    }

    /*
     * ============================== HOW TO RUN THIS TEST: ====================================
     *
     * See Notes.md. In short, from the directory gegerator-jmh :
     *    $ mvn clean package
     *    $ java -jar target/microbenchmarks.jar PlannerBenchmark
     *
     * The samples are looked up from the working directory and its parents.
     */
    public static void main(String[] args) throws RuntimeException, RunnerException {
        Options opts = new OptionsBuilder()
                .include(PlannerBenchmark.class.getSimpleName())
                .build();
        new Runner(opts).run();
    }


}
