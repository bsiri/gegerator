package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.MovieSession;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieSessionRepository extends ReactiveCrudRepository<MovieSession, Long> {

    Flux<MovieSession> findAllByMovieId(long movieId);

    @Modifying
    @Query("UPDATE movie_session SET rating = :#{T(org.bsiri.gegerator.domain.MovieSessionRating).DEFAULT}"+
            " where rating = :#{T(org.bsiri.gegerator.domain.MovieSessionRating).MANDATORY} "+
            " and movie_id = :movieId")
    Mono<Void> resetRatingsForSessionOfMovie(long movieId);

}
