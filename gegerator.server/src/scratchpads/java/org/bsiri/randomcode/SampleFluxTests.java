package org.bsiri.randomcode;

import reactor.core.Disposable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

public class SampleFluxTests {

    private static String[] lettersA = {"A", "B", "C", "D", "E"};
    private static String[] lettersB = {"V", "W", "X", "Y", "Z"};
    private static Integer[] ints = {10, 20, 30, 40, 50};


    // ************* old sandbox **************

    public static void main(String[] args ){
        blockToFlux();
    }

    private static void blockToFlux(){
        MockBlockingRepo repository = new MockBlockingRepo();

        Flux.defer(() -> Flux.fromIterable(repository.findAll()))
                .subscribeOn(Schedulers.boundedElastic())
                .doOnEach(System.out::println)
                .blockLast();
//        Flux.fromIterable(repository.findAll())
//                .subscribeOn(Schedulers.boundedElastic())
//                .doOnEach(System.out::println)
//                .blockLast();

    }

    private static void fluxToBlock(){
        MockBlockingRepo repository = new MockBlockingRepo();
        Flux<String> flux = fluxFrom(lettersB);

        flux.publishOn(Schedulers.boundedElastic())
                .doOnNext(str -> repository.save(str))
                .blockLast();

    }

    private static void zipTest(){
        Flux<String> fluxA = fluxFrom(lettersA);
        Flux<String> fluxB = fluxFrom(lettersB, 1500);
        Flux<Integer> fluxN = fluxFrom(ints, 3000);

        Flux.zip(
                (Object[] args) -> new Zip(
                        (String)args[0],
                        (String)args[1],
                        (Integer)args[2]
                ), fluxA, fluxB, fluxN)
                .log()
                .doOnEach(System.out::println)
                .blockLast();
    }

    private static void fastestMono(){
        Mono<String> monoA = monoFrom("A");
        Mono<String> monoG = monoFrom("G", 1200);
        Mono<String> monoZ = monoFrom("Z", 1100);


        Flux.firstWithValue(monoA, monoG, monoZ)
                .doOnEach(System.out::println)
                .blockLast();

        Flux.firstWithSignal(monoA, monoG, monoZ)
                .doOnEach(System.out::println)
                .blockLast();
    }

    private static void naiveMergeTimeBased(){
        System.out.println("merging fluxes...");

        Flux<String> fluxA = fluxFrom(lettersA);
        Flux<String> fluxB = fluxFrom(lettersB, 1500);

        fluxA.mergeWith(fluxB)
                .doOnEach(System.out::println)
                .blockLast();

    }

    private static void concatTimeBased(){
        System.out.println("merging fluxes...");

        Flux<String> fluxA = fluxFrom(lettersA);
        Flux<String> fluxB = fluxFrom(lettersB, 1500);

        fluxA.concatWith(fluxB)
                .doOnEach(System.out::println)
                .blockLast();
    }

    private static void concatMono(){
        System.out.println("merging monos...");

        Mono<String> monoA = monoFrom("A");
        Mono<String> monoB = monoFrom("Z", 1500);

        monoA.concatWith(monoB)
                .doOnEach(System.out::println)
                .blockLast();
    }

    private static <T> Mono<T> monoFrom(T elt){
        return monoFrom(elt, 1000);
    }

    private static <T> Flux<T> fluxFrom(T[] eltArray){
        return fluxFrom(eltArray, 1000);
    }

    private static <T> Flux<T> fluxFrom(T[] eltArray, long millis){
        return Flux.interval(Duration.ofMillis(millis))
                .map(i -> eltArray[i.intValue()])
                .take(eltArray.length);
    }

    private static <T> Mono<T> monoFrom(T elt, long millis){
        return Mono.delay(Duration.ofMillis(millis))
                .map(i -> elt);
    }

    private static class Zip{
        String letA;
        String letB;
        Integer num;
        Zip(String letA, String letB, Integer num){
            this.letA = letA;
            this.letB = letB;
            this.num = num;
        }
        @Override
        public String toString(){
            return String.format("Zip(letA=%s, letB=%s, num=%d", letA, letB, num);
        }
    }

    static class MockBlockingRepo{
        List<String> findAll(){
            return Arrays.asList(lettersA);
        }

        <T> void save(T elt){
            System.out.println("saving "+elt);
        }
    }

}
