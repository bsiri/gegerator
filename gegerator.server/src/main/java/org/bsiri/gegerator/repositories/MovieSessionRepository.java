package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.MovieSession;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieSessionRepository extends ReactiveCrudRepository<MovieSession, Long> {

    // for the SpEL in the query :
    static final String EVENT_RATING = "T(org.bsiri.gegerator.domain.EventRating)";

    Flux<MovieSession> findAllByMovieId(long movieId);

    @Modifying
    @Query("UPDATE movie_session SET rating = :#{"+EVENT_RATING+".DEFAULT}"+
            " where rating = :#{"+EVENT_RATING+".MANDATORY} "+
            " and movie_id = :movieId")
    Mono<Void> resetRatingsForSessionOfMovie(@Param("movieId") long movieId);

}
