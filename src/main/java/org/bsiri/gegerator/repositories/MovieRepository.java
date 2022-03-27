package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Movie;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MovieRepository extends ReactiveCrudRepository<Movie, Long> {

    Mono<Movie> findByName(String name);

    @Query("select distinct m.* from movie_session ms inner join movie m on ms.movie_id = m.id")
    Flux<Movie> findAllPlannedInSession();

}
