package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieService {
    Flux<Movie> findAll();

    Mono<Movie> findById(long id);

    Flux<Movie> findAllPlannedInSession();

    Mono<Movie> save(Movie movie);

    // alias for "save"
    Mono<Movie> update(Movie movie);

    Mono<Void> deleteById(long id);

    Mono<Void> deleteAll();
}
