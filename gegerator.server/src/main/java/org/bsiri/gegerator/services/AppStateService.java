package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.OtherActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.GroupedFlux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;

@Service
public class AppStateService {

    private MovieService movieService;
    private MovieSessionService sessionService;
    private OtherActivityService otherActivityService;
    private R2dbcEntityTemplate template;

    public AppStateService(@Autowired MovieService movieService,
                           @Autowired MovieSessionService sessionService,
                           @Autowired OtherActivityService otherActivityService,
                           @Autowired R2dbcEntityTemplate template) {

        this.movieService = movieService;
        this.sessionService = sessionService;
        this.otherActivityService = otherActivityService;
        this.template = template;
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

        /*
            Here we wipe the database, then we load the entities again.

            Because they already have an ID, the regular repositories
            will deduce it needs to issue UPDATE commands instead of
            INSERT. This is indeed the expected behavior most of the time.
            However, in this scenario these entities a actually new (we just wiped
            the database), the UPDATE will fail, understandably.

            To work around this we shortcut the repositories and work
            directly with the R2dbcTemplate for the insertion.

            Because of foreign keys constraints the whole thing
            happens sequentially. So much for using reactive programming ^^'
         */

        // 1. Delete everything, in sequence.
        return otherActivityService.deleteAll()
            .then(sessionService.deleteAll())
            .then(movieService.deleteAll())

        // 2. Then insert in sequence
        .thenMany(insertAll(appState.getMovies()))
        .thenMany(insertAll(appState.getSessions()))
        .thenMany(insertAll(appState.getActivities()))
        .then(Mono.empty());
    }


    private <T> Flux<T> insertAll(Collection<T> elements){
        return Flux.fromIterable(elements).flatMap(template::insert);
    }

}
