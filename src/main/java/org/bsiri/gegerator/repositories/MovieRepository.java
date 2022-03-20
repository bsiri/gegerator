package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Movie;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface MovieRepository extends ReactiveCrudRepository<Movie, Long> {

    Mono<Movie> findByName(String name);

}
