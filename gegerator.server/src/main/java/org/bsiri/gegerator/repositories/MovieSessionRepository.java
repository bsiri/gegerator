package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.MovieSession;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface MovieSessionRepository extends ReactiveCrudRepository<MovieSession, Long> {

    Flux<MovieSession> findAllByMovieId(long movieId);

}
