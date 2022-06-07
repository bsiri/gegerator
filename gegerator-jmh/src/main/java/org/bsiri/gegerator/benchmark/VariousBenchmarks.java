package org.bsiri.gegerator.benchmark;

import org.openjdk.jmh.annotations.*;

import javax.xml.crypto.Data;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
@Warmup(iterations = 2)
@Measurement(iterations = 2)
@Fork(3)
public class VariousBenchmarks {

    private static final int RAND_BOUNDARY = 10;
    private static final int LARGER_RAND_BOUNDARY = 40;


    // ********* cache design test *************************

/*
    // worst perfs
    @Benchmark
    public int countCacheHitWithAHashSet(CacheTestDataset state){
        Set<Integer> cache = new HashSet<>(3);
        for (int i=0; i<state.cached_nums.length; i++) cache.add(state.cached_nums[i]);

        int countHit = 0;
        for (int i=0; i< state.test_array.length; i++){
            if (cache.contains(state.test_array[i])) countHit ++;
        }

        return countHit;
    }


    @Benchmark
    public int countCacheHitWithAnArray(CacheTestDataset state){
        int[] cache = new int[RAND_BOUNDARY];
        for (int i=0; i<state.cached_nums.length; i++) cache[state.cached_nums[i]] = 1;

        int countHit = 0;
        for (int i=0; i< state.test_array.length; i++){
            if (cache[state.test_array[i]] == 1) countHit ++;
        }

        return countHit;
    }
    */
/*
    // Observation : much better than the Set cache, thanks to no-autoboxing I guess
    @Benchmark
    public int countLargerCacheHitWithAnArray(LargerCacheTestDataset state){
        int[] cache = new int[LARGER_RAND_BOUNDARY];
        for (int i=0; i<state.cached_nums.length; i++) cache[state.cached_nums[i]] = 1;

        int countHit = 0;
        for (int i=0; i< state.test_array.length; i++){
            if (cache[state.test_array[i]] == 1) countHit ++;
        }

        return countHit;
    }
*/
/*
    // observations : no measurable gain over the Array cache
    @Benchmark
    public int countLargerCacheHitWithBitMask(LargerCacheTestDataset state){
        long cache = 0;
        for (int i=0; i<state.cached_nums.length; i++) cache = cache | (1L << state.cached_nums[i]);

        int countHit = 0;
        for (int i=0; i< state.test_array_as_bitmasks.length; i++){
            if ( (cache & state.test_array_as_bitmasks[i]) != 0) countHit++;
        }

        return countHit;
    }
*/

    // ************** score keeping test *********************


    // works best
    @Benchmark
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    public Object[] scoreUpScoreDownByAccum(ScoresDataset state){
        long maxScore = 0L;
        long accum = 0L;
        int nbOps=0;

        for (int i=0; i< state.scores.length; i++){
            accum += state.scores[i];
            nbOps++;
        }
        maxScore = accum;
        for (int i=state.scores.length-1; i>=0; i--){
            accum -= state.scores[i];
            nbOps++;
        }

        return new Object[]{maxScore, nbOps};

    }

    // more than double the time of the other solution
    @Benchmark
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    public Object[] scoreUpScoreDownByStack(ScoresDataset state){
        int[] scoreStack = new int[state.scores.length+1];
        int top = 0;
        long maxscore = 0L;
        int nbOps = 0;

        for (int i=0; i< state.scores.length; i++){
            scoreStack[top+1] = scoreStack[top] + state.scores[i];
            top ++;
            nbOps++;
        }
        maxscore = scoreStack[top];

        for (int i = state.scores.length -1; i >=0; i--){
            top --;
            nbOps++;
        }

        return new Object[]{maxscore, nbOps};
    }

    // **************** Benchmak states **********************

    @State(Scope.Benchmark)
    public static class CacheTestDataset{
        private int[] cached_nums;
        private int[] test_array;

        @Setup
        public void newCacheTest(){
            Random r = new Random();
            IntStream intGen = IntStream.generate(() -> r.nextInt(RAND_BOUNDARY));
            cached_nums = intGen.limit(3).toArray();

            intGen = IntStream.generate(() -> r.nextInt(RAND_BOUNDARY));
            test_array = intGen.limit(10000).toArray();
        }
    }

    @State(Scope.Benchmark)
    public static class LargerCacheTestDataset{
        private int[] cached_nums;
        private int[] test_array;
        private long[] test_array_as_bitmasks;

        @Setup
        public void newCacheTest(){
            Random r = new Random();
            IntStream intGen = IntStream.generate(() -> r.nextInt(LARGER_RAND_BOUNDARY));
            cached_nums = intGen.limit(10).toArray();

            intGen = IntStream.generate(() -> r.nextInt(LARGER_RAND_BOUNDARY));
            test_array = intGen.limit(10000).toArray();
            test_array_as_bitmasks = IntStream.of(test_array).mapToLong(i -> 1L << i).toArray();
        }
    }


    @State(Scope.Benchmark)
    public static class ScoresDataset{
        private int[] scores;

        @Setup
        public void newScores(){
            Random r = new Random();
            IntStream intGen = IntStream.generate(() -> r.nextInt(10000));
            scores = intGen.limit(16).toArray();
        }
    }

}
