package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieService {
    Flux<Movie> findAll();

    Mono<Movie> findById(long id);

    Flux<Movie> findAllPlannedInSession();

    @Transactional
    Mono<Movie> save(Movie movie);

    // alias for "save"
    @Transactional
    Mono<Movie> update(Movie movie);

    @Transactional
    Mono<Void> deleteById(long id);

    @Transactional
    Mono<Void> deleteAll();
}
