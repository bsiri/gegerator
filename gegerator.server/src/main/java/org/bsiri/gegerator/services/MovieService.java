package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.services.aspect.FireModelChanged;
import org.bsiri.gegerator.services.events.MoviesChangedEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieService {
    Flux<Movie> findAll();

    Mono<Movie> findById(long id);

    Flux<Movie> findAllPlannedInSession();

    @FireModelChanged(MoviesChangedEvent.class)
    Mono<Movie> save(Movie movie);

    // alias for "save"
    @FireModelChanged(MoviesChangedEvent.class)
    Mono<Movie> update(Movie movie);

    @FireModelChanged(MoviesChangedEvent.class)
    Mono<Void> deleteById(long id);

    @FireModelChanged(MoviesChangedEvent.class)
    Mono<Void> deleteAll();
}
