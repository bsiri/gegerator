package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;
import reactor.test.StepVerifier;
import org.bsiri.gegerator.services.impl.WizardServiceImpl.ModelChangeDetector;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public class ModelChangeDetectorTests extends AbstractDBBasedServiceTest{

    private MovieRepository movieRepository;
    private ModelChangeDetector changeDetector;

    ModelChangeDetectorTests(
            @Autowired MovieRepository movieRepository,
            @Autowired ModelChangeDetector changeDetector
            ){
        this.movieRepository = movieRepository;
        this.changeDetector = changeDetector;
    }

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldThrottleEvents(){

        Sinks.Many<SampleEvent> sampleEvts = Sinks.many().unicast().onBackpressureBuffer();

        EventFactory factory = new EventFactory();
        Flux<SampleEvent> source = simulateEventBus(
            fireAfterDelay(0, list(1, factory::next)),
            fireAfterDelay(150, list(4, factory::next)),
            fireAfterDelay(500, list(2, factory::next))
        );
        flushInto(source, sampleEvts);

        Flux<SampleEvent> eventFlux = sampleEvts.asFlux()
                                            .sample(Duration.ofMillis(100));

        // Test : although the source is firing in bursts,
        // we should see only one event by time window of the sampling delay
        StepVerifier.create(eventFlux)
                .expectNextCount(1)
                .expectNoEvent(Duration.ofMillis(40))
                .expectNextCount(1)
                .expectNoEvent(Duration.ofMillis(240))
                .expectNextCount(1)
                .verifyComplete();



    }

    private Flux<SampleEvent> simulateEventBus(Flux<SampleEvent> ...fluxes){
        Flux<SampleEvent> flux = Arrays.stream(fluxes).reduce((f1, f2) -> f1.concatWith(f2)).get();
        flux.subscribeOn(Schedulers.parallel());
        return flux;
    }


    private void flushInto(Flux<SampleEvent> source, Sinks.Many<SampleEvent> sink){
        source.subscribe(sink::tryEmitNext,
                (err) -> {},
                () -> sink.emitComplete(Sinks.EmitFailureHandler.FAIL_FAST));
    }


    // ******** utils ***********
    private class EventFactory{
        private int counter = 0;
        SampleEvent next(){
            return new SampleEvent(counter++);
        }
    }

    private class SampleEvent{
        int num;
        public SampleEvent(int num){this.num = num;};
        public String toString(){return "event-"+ this.num;}
    }

    private <R> List<R> list(int homMany, Supplier<R> supplier){
        List<R> lst = new ArrayList<>();
        for (int i=0;i<homMany; i++) lst.add(supplier.get());
        return lst;
    }

    private <R> Flux<R> fireAfterDelay(int delay, List<R> objects){
        return Flux.fromIterable(objects).delaySequence(Duration.ofMillis(delay)).take(objects.size());
    }

}
