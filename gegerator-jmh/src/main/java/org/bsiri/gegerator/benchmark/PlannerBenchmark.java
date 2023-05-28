package org.bsiri.gegerator.benchmark;


import org.bsiri.gegerator.planner.*;
import org.bsiri.gegerator.planner.exoticplanners.BlobPlanner;
import org.bsiri.gegerator.planner.graphplanners.RankedPathGraphPlanner;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MILLISECONDS)

@Warmup(iterations = 3, time = 15)
@Measurement(iterations = 3, time = 5)

/*
@Warmup(iterations = 2)
@Measurement(iterations = 2)
*/
@Timeout(time =11)
@Fork(1)
public class PlannerBenchmark {

    private static int NB_SESSIONS = 96;
    private static int NB_ACTIVITIES = 3;

    @State(Scope.Benchmark)
    public static class DatasetState{
        int nbsessions = NB_SESSIONS;
        int nbactivities = NB_ACTIVITIES;
        List<PlannerEvent>  events = new ArrayList<>();

        public DatasetState() {
        }

        public DatasetState(int nbsessions, int nbactivities) {
            this.nbsessions = nbsessions;
            this.nbactivities = nbactivities;
        }

        @Setup()
        public void newEvents(){
            //this.events = Datasets.shuffledSmallDataset();
            this.events = Datasets.generateDatasetOf(nbsessions, nbactivities);
        }

    }


    /**
     * This one is also the baseline
     */

/*
    @Benchmark
    public List<PlannerEvent> benchDailyGraphPlanner(DatasetState dataset){
        return new DailyGraphPlanner(dataset.events).findBestRoadmap();
    }

    @Benchmark
    public List<PlannerEvent> benchIterativeGraphPlanner(DatasetState dataset){
        return new IterativeGraphPlanner(dataset.events).findBestRoadmap();
    }
*/
/*
    @Benchmark
    public List<PlannerEvent> benchNaiveGraphPlanner(DatasetState dataset){
        return new NaiveGraphPlanner(dataset.events).findBestRoadmap();
    }
*/

/*
    @Benchmark
    public List<PlannerEvent> benchIterativeGraphPlannerV2(DatasetState dataset){
        return new IterativeGraphPlannerV2(dataset.events).findBestRoadmap();
    }

*/
    @Benchmark
    public List<PlannerEvent> benchRankedPathGraphPlanner(DatasetState state){
        return new RankedPathGraphPlanner(state.events).findBestRoadmap();
    }

    @Benchmark
    public List<PlannerEvent> benchBlobPlanner(DatasetState state){
        return new BlobPlanner(state.events).findBestRoadmap();
    }

    /*
     * ============================== HOW TO RUN THIS TEST: ====================================
     *
     * Note JMH honors the default annotation settings. You can always override
     * the defaults via the command line or API.
     *
     * You can run this test:
     *
     * a) Via the command line:
     *    $ mvn clean install
     *    $ java -jar target/microBenchmarks.jar PlannerBenchmark
     *
     * b) Via the Java API:
     *    (see the JMH homepage for possible caveats when running from IDE:
     *      http://openjdk.java.net/projects/code-tools/jmh/)
     */
    public static void main(String[] args) throws RuntimeException, RunnerException {
        Options opts = new OptionsBuilder()
                .include(PlannerBenchmark.class.getSimpleName())
                .include(VariousBenchmarks.class.getSimpleName())
                .build();
        new Runner(opts).run();
    }


}
