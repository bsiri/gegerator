package org.bsiri.gegerator.services;


import org.bsiri.gegerator.config.Scoring;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.*;
import org.bsiri.gegerator.graph.EventGraph;
import org.bsiri.gegerator.graph.EventNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WizardService {

    private Scoring scoring;
    private ConfigurationService confService;
    private MovieService movieService;
    private MovieSessionService sessionService;
    private OtherActivityService activityService;

    public WizardService(@Autowired Scoring scoring,
                         @Autowired ConfigurationService confService,
                         @Autowired MovieService movieService,
                         @Autowired MovieSessionService sessionService,
                         @Autowired OtherActivityService activityService) {
        this.scoring = scoring;
        this.confService = confService;
        this.movieService = movieService;
        this.sessionService = sessionService;
        this.activityService = activityService;
    }

    public Mono<List<PlannableEvent>> findBestRoadmap() {
        Mono<WizardConfiguration> wizconfMono = confService.getWizardConfiguration();
        Mono<List<OtherActivity>> activitiesMono = activityService.findAll().collectList();
        Mono<List<Movie>> plannedMoviesMono = movieService.findAllPlannedInSession().collectList();
        Mono<List<MovieSession>> sessionsMono = sessionService.findAll().collectList();

        return Flux.combineLatest(wizconfMono,
                activitiesMono,
                plannedMoviesMono,
                sessionsMono,
                // damn you type erasure !
                (Object[] ingredients) -> {
                    WizardConfiguration wizconf = (WizardConfiguration) ingredients[0];
                    List<OtherActivity> activities = (List<OtherActivity>) ingredients[1];
                    List<Movie> movies = (List<Movie>) ingredients[2];
                    List<MovieSession> sessions = (List<MovieSession>) ingredients[3];

                    List<EventNode> events = toEventNodes(wizconf, activities, movies, sessions);
                    return findBestRoadmap(events);
                }
        ).last();

    }


    private List<EventNode> toEventNodes(
                WizardConfiguration wizconf,
                List<OtherActivity> activities,
                List<Movie> movies,
                List<MovieSession> sessions){
        Map<Long, Movie> moviesById = movies.stream().collect(Collectors.toMap(Movie::getId, Function.identity()));

        List<EventNode> events = sessions
                .stream()
                .map(session -> createNode(wizconf, session, moviesById.get(session.getMovieId())))
                .collect(Collectors.toList());

        activities.stream().map(activity -> createNode(wizconf, activity)).forEach(events::add);

        return events;
    }

    private List<PlannableEvent> findBestRoadmap(List<EventNode> events){
        EventGraph graph = new EventGraph(events);
        return graph.findBestRoadmap().stream().map(EventNode::getRepresentedEvent).collect(Collectors.toList());
    }

    private EventNode createNode(WizardConfiguration wizconf, MovieSession session, Movie movie) {
        // Take that Demeter, I'm a thug bro !
        int tScore = scoring.getScore(wizconf.getTheaterRating(session.getTheater()));
        int sScore = scoring.getScore(session.getRating());
        int mScore = scoring.getScore(movie.getRating());
        float bias = wizconf.getMovieVsTheaterBias();

        int finalscore = (int)(((1.0-bias) * mScore) + (bias * tScore) + sScore);

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

    private EventNode createNode(WizardConfiguration wizconf, OtherActivity activity){
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
}
