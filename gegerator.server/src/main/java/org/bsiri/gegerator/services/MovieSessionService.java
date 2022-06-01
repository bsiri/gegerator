package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.services.aspect.FireModelChanged;
import org.bsiri.gegerator.services.events.SessionsChangedEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieSessionService {
    Mono<MovieSession> findById(long id);

    Flux<MovieSession> findAll();

    @FireModelChanged(SessionsChangedEvent.class)
    Mono<MovieSession> save(MovieSession movieSession);

    @FireModelChanged(SessionsChangedEvent.class)
    Mono<MovieSession> update(MovieSession movieSession);

    @FireModelChanged(SessionsChangedEvent.class)
    Mono<Void> deleteById(long id);

    @FireModelChanged(SessionsChangedEvent.class)
    Mono<Void> deleteAll();
}
