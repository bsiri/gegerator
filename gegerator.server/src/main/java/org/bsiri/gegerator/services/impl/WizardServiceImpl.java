package org.bsiri.gegerator.services.impl;


import org.bsiri.gegerator.config.Scoring;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.*;
import org.bsiri.gegerator.planner.*;
import org.bsiri.gegerator.services.*;
import org.bsiri.gegerator.services.events.MoviesChangedEvent;
import org.bsiri.gegerator.services.events.OtherActivitiesChangedEvent;
import org.bsiri.gegerator.services.events.SessionsChangedEvent;
import org.bsiri.gegerator.services.events.WizardConfChangedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple4;
import reactor.util.function.Tuples;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WizardServiceImpl implements WizardService {

    private static final Integer PLANNER_IMPL_THRESHOLD = 30;

    private static final Duration THROTTLE_TIME = Duration.ofMillis(100);

    private Scoring scoring;
    private ModelChangeDetector changeDetector;

    private Sinks.Many<List<PlannableEvent>> roadmapFlux = Sinks.many().multicast().onBackpressureBuffer();

    public WizardServiceImpl(@Autowired Scoring scoring,
                             @Autowired ModelChangeDetector changeDetector) {
        this.scoring = scoring;
        this.changeDetector = changeDetector;
    }

    @PostConstruct
    public void initRoadmapFlux(){
        Flux.combineLatest(
                changeDetector.wizconfFlux,
                changeDetector.moviesFlux,
                changeDetector.sessionsFlux,
                changeDetector.activitiesFlux,
                this::toTuple)
                .publishOn(Schedulers.parallel())
                .sample(THROTTLE_TIME)  // Limit rate in case inputs are raining
                .map(tuple -> toEventNodes(tuple.getT1(), tuple.getT2(), tuple.getT3(), tuple.getT4()))
                .map(this::findBestRoadmap)
                .onErrorReturn(new ArrayList<>())
                .log()
                .subscribe(
                        roadmapFlux::tryEmitNext,
                        this::logError,
                        () -> System.out.println("damnit I completed !")
                );
    }

    private void logError(Throwable error){
        // TODO : a logger, maybe ?
        error.printStackTrace();
    }

    @Override
    public Flux<List<PlannableEvent>> streamBestRoadmap() {
        return roadmapFlux.asFlux();
    }


     List<PlannerEvent> toEventNodes(
                WizardConfiguration wizconf,
                List<Movie> movies,
                List<MovieSession> sessions,
                List<OtherActivity> activities){

        Map<Long, Movie> moviesById = movies.stream().collect(Collectors.toMap(Movie::getId, Function.identity()));

        List<PlannerEvent> events = sessions
                .stream()
                .map(session -> createPlannerEvent(wizconf, session, moviesById.get(session.getMovieId())))
                .collect(Collectors.toList());

        activities.stream().map(activity -> createPlannerEvent(wizconf, activity)).forEach(events::add);

        return events;
    }

    List<PlannableEvent> findBestRoadmap(List<PlannerEvent> events){
        WizardPlanner graph = createPlanner(events);
        return graph.findBestRoadmap().stream().map(PlannerEvent::getRepresentedEvent).collect(Collectors.toList());
    }

    PlannerEvent createPlannerEvent(WizardConfiguration wizconf, MovieSession session, Movie movie) {
        int finalscore = calculateSessionScore(wizconf, session, movie);
        return PlannerEvent.of(session, movie, finalscore);
    }

    PlannerEvent createPlannerEvent(WizardConfiguration wizconf, OtherActivity activity){
        int finalScore = scoring.getScore(activity.getRating());
        return PlannerEvent.of(activity, finalScore);
    }

    int calculateSessionScore(WizardConfiguration wizconf, MovieSession session, Movie movie) {
        // Take that Demeter !
        int tScore = scoring.getScore(wizconf.getTheaterRating(session.getTheater()));
        int sScore = scoring.getScore(session.getRating());
        int mScore = scoring.getScore(movie.getRating());
        float bias = wizconf.getMovieVsTheaterBias();

        int finalscore = (int)(((1.0-bias) * mScore) + (bias * tScore) + sScore);
        return finalscore;
    }

    private Tuple4<WizardConfiguration, List<Movie>, List<MovieSession>, List<OtherActivity>> toTuple(Object[] params){
        return Tuples.of(
                (WizardConfiguration) params[0],
                (List<Movie>) params[1],
                (List<MovieSession>) params[2],
                (List<OtherActivity>) params[3]
        );
    }

    private WizardPlanner createPlanner(List<PlannerEvent> events){
        // if the problem is small enough -> use an exact solver
        if (events.size() <= PLANNER_IMPL_THRESHOLD){
            return new IterativeGraphPlannerV2(events);
        }
        // else, use an approximate solver
        else{
            return new RankedPathGraphPlanner(events);
        }
    }

    // ************** Internal event listener ********************/

    @Component
    static class ModelChangeDetector{

        private static final Duration THROTTLE = Duration.ofMillis(100);

        private ConfigurationService confService;
        private MovieService movieService;
        private MovieSessionService sessionService;
        private OtherActivityService activityService;

        private Sinks.Many<MoviesChangedEvent> movieEvtFlux = newSink();
        private Sinks.Many<SessionsChangedEvent> sessionEvtFlux = newSink();
        private Sinks.Many<OtherActivitiesChangedEvent> actEvtFlux = newSink();
        private Sinks.Many<WizardConfChangedEvent> wcEvtFlux = newSink();

        // left with package access for test purposes
        Flux<List<Movie>> moviesFlux = null;
        Flux<List<MovieSession>> sessionsFlux = null;
        Flux<List<OtherActivity>> activitiesFlux = null;
        Flux<WizardConfiguration> wizconfFlux = null;

        public ModelChangeDetector(@Autowired ConfigurationService confService,
                                   @Autowired MovieService movieService,
                                   @Autowired MovieSessionService sessionService,
                                   @Autowired OtherActivityService activityService) {
            this.confService = confService;
            this.movieService = movieService;
            this.sessionService = sessionService;
            this.activityService = activityService;

            initFluxes();
        }

        private void initFluxes(){
            prepareMoviesFlux();
            prepareSessionFlux();
            prepareActivitiesFlux();
            prepareWizconfFlux();
        }

        private void prepareMoviesFlux(){
            moviesFlux = movieEvtFlux.asFlux()
                    .sample(THROTTLE)
                    .flatMap( evt -> movieService.findAllPlannedInSession().collectList() );
        }

        private void prepareSessionFlux(){
            sessionsFlux = sessionEvtFlux.asFlux()
                    .sample(THROTTLE)
                    .flatMap(evt -> sessionService.findAll().collectList());
        }

        private void prepareActivitiesFlux(){
            activitiesFlux = actEvtFlux.asFlux()
                    .sample(THROTTLE)
                    .flatMap(evt -> activityService.findAll().collectList());
        }

        private void prepareWizconfFlux(){
            wizconfFlux = wcEvtFlux.asFlux()
                    .sample(THROTTLE)
                    .flatMap(evt -> confService.getWizardConfiguration());
        }

        // ********* events reaction *************

        /*
            Here we emit without caring whether the event was pushed,
            because failure is not important.
            Also the streams are not supposed to close for the whole
            lifetime of the application.
         */

        @EventListener
        private void warmupWhenAppReady(ApplicationReadyEvent appReady){
            movieEvtFlux.tryEmitNext(new MoviesChangedEvent());
            sessionEvtFlux.tryEmitNext(new SessionsChangedEvent());
            actEvtFlux.tryEmitNext(new OtherActivitiesChangedEvent());
            wcEvtFlux.tryEmitNext(new WizardConfChangedEvent());
        }

        @EventListener
        void onMoviesChanged(MoviesChangedEvent event){
            // No check for the EmitResult : it's ok to fail
            movieEvtFlux.tryEmitNext(event);
        }

        @EventListener
        void onSessionsChanged(SessionsChangedEvent event){
            sessionEvtFlux.tryEmitNext(event);
        }

        @EventListener
        void onActivitiesChanged(OtherActivitiesChangedEvent event){
            actEvtFlux.tryEmitNext(event);
        }

        @EventListener
        void onWizconfChanged(WizardConfChangedEvent event){
            wcEvtFlux.tryEmitNext(event);
        }

        // ********* other builders ****************

        <R> Sinks.Many<R> newSink(){
            return Sinks.many()
                    .unicast()
                    .onBackpressureBuffer();
        }

    }

}
