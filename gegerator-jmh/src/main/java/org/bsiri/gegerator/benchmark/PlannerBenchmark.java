package org.bsiri.gegerator.benchmark;


import org.bsiri.gegerator.planner.GraphBasedPlanner;
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
@Warmup(iterations = 2, time = 5, timeUnit = TimeUnit.MICROSECONDS)
@Measurement(iterations = 5, time = 25, timeUnit = TimeUnit.MICROSECONDS)
public class PlannerBenchmark {

    @State(Scope.Benchmark)
    public static class DatasetState{
        List<PlannerEvent>  events = new ArrayList<PlannerEvent>();

        @Setup(Level.Iteration)
        public void newEvents(){
            this.events = Datasets.shuffledSmallDataset();
        }

    }


    @Benchmark
    public List<PlannerEvent> benchGraphBasedPlanner(DatasetState dataset){
        return new GraphBasedPlanner(dataset.events).findBestRoadmap();
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
