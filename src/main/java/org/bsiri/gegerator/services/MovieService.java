package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MovieService {

    private MovieRepository repo;

    public MovieService(@Autowired MovieRepository repo){
        this.repo = repo;
    }


    public Flux<Movie> findAll(){
        return repo.findAll();
    }

    public Mono<Movie> findById(long id){
        return repo.findById(id);
    }

}
