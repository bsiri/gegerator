package org.bsiri.gegerator.repositories;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface MovieSessionTupleRepository extends ReactiveCrudRepository<MovieSessionTuple, Long> {

    Flux<MovieSessionTuple> findAllByMovieId(long movieId);

}