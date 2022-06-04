package org.bsiri.gegerator.services.impl;


import org.bsiri.gegerator.config.Scoring;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.*;
import org.bsiri.gegerator.graph.EventGraph;
import org.bsiri.gegerator.graph.EventNode;
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
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.publisher.Sinks.*;
import reactor.util.function.Tuple4;
import reactor.util.function.Tuples;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WizardServiceImpl implements WizardService {

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
                .sample(THROTTLE_TIME)  // Limit rate in case inputs are raining
                .map(tuple -> toEventNodes(tuple.getT1(), tuple.getT2(), tuple.getT3(), tuple.getT4()))
                .map(this::findBestRoadmap)
                .subscribe(roadmapFlux::tryEmitNext);
    }

    @Override
    public Flux<List<PlannableEvent>> streamBestRoadmap() {
        return roadmapFlux.asFlux();
    }


     List<EventNode> toEventNodes(
                WizardConfiguration wizconf,
                List<Movie> movies,
                List<MovieSession> sessions,
                List<OtherActivity> activities){

        Map<Long, Movie> moviesById = movies.stream().collect(Collectors.toMap(Movie::getId, Function.identity()));

        List<EventNode> events = sessions
                .stream()
                .map(session -> createNode(wizconf, session, moviesById.get(session.getMovieId())))
                .collect(Collectors.toList());

        activities.stream().map(activity -> createNode(wizconf, activity)).forEach(events::add);

        return events;
    }

    List<PlannableEvent> findBestRoadmap(List<EventNode> events){
        EventGraph graph = new EventGraph(events);
        return graph.findBestRoadmap().stream().map(EventNode::getRepresentedEvent).collect(Collectors.toList());
    }

    EventNode createNode(WizardConfiguration wizconf, MovieSession session, Movie movie) {
        int finalscore = calculateSessionScore(wizconf, session, movie);

        return new EventNode(
            session,
            String.format("%s - %s - %s - %s",
                    session.getDay(),
                    session.getStartTime(),
                    session.getTheater(),
                    movie.getTitle()
            ),
            finalscore,
            movie.getId(),
            session.getTheater(),
                session.getDay(),
                session.getStartTime(),
                session.getStartTime().plus(movie.getDuration())
            );

    }

    int calculateSessionScore(WizardConfiguration wizconf, MovieSession session, Movie movie) {
        // Take that Demeter, I'm a thug bro !
        int tScore = scoring.getScore(wizconf.getTheaterRating(session.getTheater()));
        int sScore = scoring.getScore(session.getRating());
        int mScore = scoring.getScore(movie.getRating());
        float bias = wizconf.getMovieVsTheaterBias();

        int finalscore = (int)(((1.0-bias) * mScore) + (bias * tScore) + sScore);
        return finalscore;
    }

    EventNode createNode(WizardConfiguration wizconf, OtherActivity activity){
        long finalScore = scoring.getScore(activity.getRating());
        return new EventNode(
            activity,
            String.format("%s - %s - %s",
                    activity.getDay(),
                    activity.getStartTime(),
                    activity.getDescription()
            ),
            finalScore,
            null,
            null,
            activity.getDay(),
            activity.getStartTime(),
            activity.getEndTime()
        );
    }

    private Tuple4<WizardConfiguration, List<Movie>, List<MovieSession>, List<OtherActivity>> toTuple(Object[] params){
        return Tuples.of(
                (WizardConfiguration) params[0],
                (List<Movie>) params[1],
                (List<MovieSession>) params[2],
                (List<OtherActivity>) params[3]
        );
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
