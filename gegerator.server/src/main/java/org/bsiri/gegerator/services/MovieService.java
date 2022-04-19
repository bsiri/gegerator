package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.exceptions.DuplicateNameException;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;


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

    @Transactional
    public Mono<Movie> save(Movie movie){
        return repo.save(movie)
                .onErrorMap(
                        DataIntegrityViolationException.class,
                        ex -> new DuplicateNameException((movie.getTitle()))
                );
    }

    @Transactional
    public void saveAll(Collection<Movie> movies){
        repo.saveAll(movies);
    }

    // alias for "save"
    @Transactional
    public Mono<Movie> update(Movie movie){
        return save(movie);
    }

    @Transactional
    public Mono<Void> deleteById(long id){
        return repo.deleteById(id);
    }

}
