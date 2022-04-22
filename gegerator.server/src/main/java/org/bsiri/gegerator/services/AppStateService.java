package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.OtherActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.GroupedFlux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class AppStateService {

    private MovieService movieService;
    private MovieSessionService sessionService;
    private OtherActivityService otherActivityService;

    public AppStateService(@Autowired MovieService movieService,
                           @Autowired  MovieSessionService sessionService,
                           @Autowired OtherActivityService otherActivityService) {
        this.movieService = movieService;
        this.sessionService = sessionService;
        this.otherActivityService = otherActivityService;
    }

    public Mono<AppState> dumpAppState(){
        Mono<List<Movie>> movies = movieService.findAll().collectList();
        Mono<List<MovieSession>> sessions = sessionService.findAll().collectList();
        Mono<List<OtherActivity>> activities = otherActivityService.findAll().collectList();

        return Mono.zip(movies, sessions, activities)
            .map(tuple -> new AppState(tuple.getT1(), tuple.getT2(), tuple.getT3()));
    }

    @Transactional
    public Mono<Void> loadAppState(AppState appState){

        // Here we wipe the database
        // then we populate it again

        // 1. Delete everything, in sequence.
        return otherActivityService.deleteAll()
            .then(sessionService.deleteAll())
            .then(movieService.deleteAll())

        // 2. Then insert in sequence
            .thenMany(Flux.merge(
                movieService.saveAll(appState.getMovies()),
                sessionService.saveAll(appState.getSessions()),
                otherActivityService.saveAll(appState.getActivities())
            ))
            .then(Mono.empty());
    }
}