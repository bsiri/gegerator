package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.exceptions.DuplicateNameException;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.services.MovieService;
import org.bsiri.gegerator.services.aspect.FireModelChanged;
import org.bsiri.gegerator.services.events.MoviesChangedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;



@Service
public class MovieServiceImpl implements MovieService {

    private MovieRepository repo;

    public MovieServiceImpl(@Autowired MovieRepository repo){
        this.repo = repo;
    }

    @Override
    public Flux<Movie> findAll(){
        return repo.findAll();
    }

    @Override
    public Mono<Movie> findById(long id){
        return repo.findById(id);
    }

    @Override
    public Flux<Movie> findAllPlannedInSession(){
        return repo.findAllPlannedInSession();
    }

    @Override
    @Transactional
    @FireModelChanged(MoviesChangedEvent.class)
    public Mono<Movie> save(Movie movie){
        return repo.save(movie)
                .onErrorMap(
                        DataIntegrityViolationException.class,
                        ex -> new DuplicateNameException((movie.getTitle()))
                );
    }

    // alias for "save"
    @Override
    @Transactional
    @FireModelChanged(MoviesChangedEvent.class)
    public Mono<Movie> update(Movie movie){
        return save(movie);
    }

    @Override
    @Transactional
    @FireModelChanged(MoviesChangedEvent.class)
    public Mono<Void> deleteById(long id){
        return repo.deleteById(id);
    }

    @Override
    @Transactional
    @FireModelChanged(MoviesChangedEvent.class)
    public Mono<Void> deleteAll(){
        return repo.deleteAll();
    }

}
