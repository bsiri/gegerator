package org.bsiri.gegerator.benchmark;


import org.bsiri.gegerator.planner.NaiveGraphPlanner;
import org.bsiri.gegerator.planner.PlannerEvent;
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
@Warmup(iterations = 2, time = 5, timeUnit = TimeUnit.MILLISECONDS)
@Measurement(iterations = 5, time = 25, timeUnit = TimeUnit.MILLISECONDS)
public class PlannerBenchmark {

    private static int NB_SESSIONS = 35;
    private static int NB_ACTIVITIES = 3;

    @State(Scope.Benchmark)
    public static class DatasetState{
        List<PlannerEvent>  events = new ArrayList<PlannerEvent>();

        @Setup(Level.Iteration)
        public void newEvents(){
            //this.events = Datasets.shuffledSmallDataset();
            this.events = Datasets.generateDatasetOf(NB_SESSIONS, NB_ACTIVITIES);
        }

    }


    @Benchmark
    /**
     * This one is also the baseline
     */
    public List<PlannerEvent> benchNaiveGraphPlanner(DatasetState dataset){
        return new NaiveGraphPlanner(dataset.events).findBestRoadmap();
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
                .build();
        new Runner(opts).run();
    }


}
