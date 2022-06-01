package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.config.AppState;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.OtherActivity;
import org.bsiri.gegerator.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;

@Service
public class AppStateServiceImpl implements AppStateService {

    private ConfigurationService confService;
    private MovieService movieService;
    private MovieSessionService sessionService;
    private OtherActivityService otherActivityService;
    private R2dbcEntityTemplate template;

    public AppStateServiceImpl(@Autowired ConfigurationService confService,
                           @Autowired MovieService movieService,
                           @Autowired MovieSessionService sessionService,
                           @Autowired OtherActivityService otherActivityService,
                           @Autowired R2dbcEntityTemplate template) {

        this.confService = confService;
        this.movieService = movieService;
        this.sessionService = sessionService;
        this.otherActivityService = otherActivityService;
        this.template = template;
    }

    @Override
    public Mono<AppState> dumpAppState(){
        Mono<WizardConfiguration> wizconf = confService.getWizardConfiguration();
        Mono<List<Movie>> movies = movieService.findAll().collectList();
        Mono<List<MovieSession>> sessions = sessionService.findAll().collectList();
        Mono<List<OtherActivity>> activities = otherActivityService.findAll().collectList();

        return Mono.zip(wizconf, movies, sessions, activities)
            .map(tuple -> new AppState(tuple.getT1(), tuple.getT2(), tuple.getT3(), tuple.getT4()));
    }



    @Override
    public Mono<AppState> loadAppState(AppState appState){

        /*
            Here we wipe the database, then we load the entities again.

            Because they already have an ID, the regular repositories
            will deduce it needs to issue UPDATE commands instead of
            INSERT. This is indeed the expected behavior most of the time.
            However, in this scenario these entities are actually new (we just wiped
            the database) so the UPDATE will fail, understandably.

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
        .then(confService.setWizardConfiguration(appState.getWizardConfiguration()))
        .thenMany(insertAll(appState.getMovies()))
        .thenMany(insertAll(appState.getSessions()))
        .thenMany(insertAll(appState.getActivities()))
        .then(Mono.just(appState));
    }


    private <T> Flux<T> insertAll(Collection<T> elements){
        return Flux.fromIterable(elements).flatMap(template::insert);
    }

}
