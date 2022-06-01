package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.MovieSession;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieSessionService {
    Mono<MovieSession> findById(long id);

    Flux<MovieSession> findAll();

    @Transactional
    Mono<MovieSession> save(MovieSession movieSession);

    @Transactional
    Mono<MovieSession> update(MovieSession movieSession);

    @Transactional
    Mono<Void> deleteById(long id);

    @Transactional
    Mono<Void> deleteAll();
}
