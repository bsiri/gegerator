package org.bsiri.gegerator.services.impl;

import lombok.SneakyThrows;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.services.ConfigurationService;
import org.bsiri.gegerator.services.MovieService;
import org.bsiri.gegerator.services.MovieSessionService;
import org.bsiri.gegerator.services.OtherActivityService;
import static org.bsiri.gegerator.testinfra.TestBeans.*;

import org.bsiri.gegerator.services.events.MoviesChangedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.platform.commons.util.ReflectionUtils;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;
import reactor.test.StepVerifier;
import org.bsiri.gegerator.services.impl.WizardServiceImpl.ModelChangeDetector;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

@ExtendWith(MockitoExtension.class)
public class ModelChangeDetectorTests {

    @Mock private ConfigurationService confService;
    @Mock private MovieService movieService;
    @Mock private MovieSessionService sessionService;
    @Mock private OtherActivityService actServices;

    private ModelChangeDetector changeDetector;

    @BeforeEach
    public void setup(){
        changeDetector = new ModelChangeDetector(
                confService,
                movieService,
                sessionService,
                actServices
        );
    }

    /*
        That test is not really related to the actually implementation
        but just serves to validate general bricks
     */
    @Test
    public void shouldThrottleEvents(){

        Sinks.Many<SampleEvent> sampleEvts = changeDetector.newSink();

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

    @Test
    public void shouldReloadMoviesOnEventWithThrottling(){
        // **** Test setup ****
        List<Movie> moviesBurst1 = Arrays.asList(tremors(), halloween(), theMist());
        List<Movie> moviesBurst2 = Arrays.asList();
        List<Movie> moviesBurst3 = Arrays.asList(decapitron());

        //when(movieService.findAllPlannedInSession()).thenReturn(
        when(movieService.findAll()).thenReturn(
            Flux.fromIterable(moviesBurst1),
            Flux.fromIterable(moviesBurst2),
            Flux.fromIterable(moviesBurst3),
            Flux.error(new RuntimeException("too many calls !"))
        );

        // TODO : use a test publisher instead ?
        MoviesChangedEvent event = new MoviesChangedEvent();
        Supplier<MoviesChangedEvent> eventSupplier = () -> event;
        Flux<MoviesChangedEvent> simulateUserActions = simulateEventBus(
            fireAfterDelay(0, list(1, eventSupplier )),
            fireAfterDelay(150, list(10, eventSupplier)),
            fireAfterDelay(500, list(3, eventSupplier))
        );

        flushInto(simulateUserActions,
                (evt) -> changeDetector.onMoviesChanged(evt),
                // sorry to break the abstraction,
                // but I need to complete that flux
                () -> { completeSink("movieEvtFlux"); }
        );

        // ******* our verifying steps *******

        StepVerifier.create(changeDetector.moviesFlux)
                    .expectNext(moviesBurst1)
                    .expectNoEvent(Duration.ofMillis(40))
                    .expectNext(moviesBurst2)
                    .expectNoEvent(Duration.ofMillis(240))
                    .expectNext(moviesBurst3)
                    .verifyComplete();
    }

    @SneakyThrows
    private void completeSink(String sinkName) {
        Field sinkField = ModelChangeDetector.class.getDeclaredField("movieEvtFlux");
        ReflectionUtils.makeAccessible(sinkField);
        Sinks.Many<?> sink = (Sinks.Many)ReflectionUtils.tryToReadFieldValue(sinkField, changeDetector).get();
        Method complete = sinkField.getType().getMethod("emitComplete", Sinks.EmitFailureHandler.class);
        ReflectionUtils.invokeMethod(complete, sink, Sinks.EmitFailureHandler.FAIL_FAST);
    }

    //* ********************  *************************

    private <R> Flux<R> simulateEventBus(Flux<R> ...fluxes){
        Flux<R> flux = Arrays.stream(fluxes).reduce(Flux::concatWith).get();
        flux.subscribeOn(Schedulers.parallel());
        return flux;
    }


    private <R> void flushInto(Flux<R> source, Sinks.Many<R> sink){
        source.subscribe(sink::tryEmitNext,
                (err) -> {},
                () -> sink.emitComplete(Sinks.EmitFailureHandler.FAIL_FAST));
    }

    private <R> void flushInto(Flux<R> source, Consumer<R> onNext, Runnable onComplete){
        source.subscribe(
                onNext,
                (err) ->{},
                onComplete
        );
    }

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

    private <R> List<R> list(int howMany, Supplier<R> supplier){
        List<R> lst = new ArrayList<>();
        for (int i=0;i<howMany; i++) lst.add(supplier.get());
        return lst;
    }

    private <R> Flux<R> fireAfterDelay(int delay, List<R> objects){
        return Flux.fromIterable(objects).delaySequence(Duration.ofMillis(delay)).take(objects.size());
    }

}
