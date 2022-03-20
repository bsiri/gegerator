package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Movie;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface MovieRepository extends ReactiveCrudRepository<Movie, Long> {


}
