package org.bsiri.gegerator.benchmark;

import org.bsiri.gegerator.planner.graphplanners.IterativeGraphPlannerV2;
import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.graphplanners.RankedPathGraphPlanner;
import org.bsiri.gegerator.planner.exoticplanners.BlobPlanner;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class Scratchpad {

    private static long getTotalScore(List<PlannerEvent> roadmap){
        return roadmap.stream().map(PlannerEvent::getScore).reduce(0L, (acc, next) -> acc+next);
    }

    private static final void comparePathCount(){

        PlannerBenchmark.DatasetState state = new PlannerBenchmark.DatasetState();

        for (int i=0; i<10; i++){
            state.newEvents();
            IterativeGraphPlannerV2 v2 = new IterativeGraphPlannerV2(state.events);
            RankedPathGraphPlanner rank =  new RankedPathGraphPlanner(state.events);

            long v2Count = v2.countPaths();
            long rankCount = rank.countPaths();

            System.out.println(String.format("v2 : %d,  rank : %d", v2Count, rankCount));
        }
    }

    private static void samplebestpath(){
        PlannerBenchmark.DatasetState state = new PlannerBenchmark.DatasetState(96, 3);
        state.newEvents();
        RankedPathGraphPlanner graph = new RankedPathGraphPlanner(state.events);
        List<PlannerEvent> bestpath = graph.findBestRoadmap();

        List<PlannerEvent> sorted = bestpath.stream()
                .sorted(Comparator.comparing(PlannerEvent::getDay).thenComparing(PlannerEvent::getStartTime)).collect(Collectors.toList());

        long score = sorted.stream().map(PlannerEvent::getScore).reduce(0L, (acc, next) -> acc+next);
        sorted.forEach(evt -> {
            String theater = evt.getTheater() != null ? evt.getTheater().name() : "special event";
            System.out.println(String.format("%s, %s-%s : %s", evt.getDay(), evt.getStartTime(), evt.getEndTime(), theater));
        });
        System.out.println("total score : "+score);
    }

    private static void rankedPathVsBlobs(){
        PlannerBenchmark.DatasetState state = new PlannerBenchmark.DatasetState(96, 3);
        state.newEvents();

        RankedPathGraphPlanner graph = new RankedPathGraphPlanner(state.events);
        List<PlannerEvent> bestRankedPathRoadmap = graph.findBestRoadmap();
        System.out.println("ranked path best score : "+getTotalScore(bestRankedPathRoadmap));

        BlobPlanner blobs = new BlobPlanner(state.events);
        List<PlannerEvent> bestBlobsRoadmap = blobs.findBestRoadmap();
        System.out.println("blob best score : "+getTotalScore(bestBlobsRoadmap));


    }

    public static void rankedstats(){

        PlannerBenchmark.DatasetState state = new PlannerBenchmark.DatasetState(96, 3);
        state.newEvents();
        RankedPathGraphPlanner graph = new RankedPathGraphPlanner(state.events);
        graph.stats();
    }

    public static void main(String[] args) {
//        comparePathCount();
//        rankedstats();
        //samplebestpath();
        rankedPathVsBlobs();
    }

}
