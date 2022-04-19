package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.OtherActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
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

    public void loadAppState(AppState appState){
        movieService.saveAll(appState.getMovies());
        sessionService.saveAll(appState.getSessions());
        otherActivityService.saveAll(appState.getActivities());
    }
}
