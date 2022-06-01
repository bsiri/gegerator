package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.MovieSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieSessionService {
    Mono<MovieSession> findById(long id);

    Flux<MovieSession> findAll();

    Mono<MovieSession> save(MovieSession movieSession);

    Mono<MovieSession> update(MovieSession movieSession);

    Mono<Void> deleteById(long id);

    Mono<Void> deleteAll();
}
