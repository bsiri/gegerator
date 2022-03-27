package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Identifiable;
import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTuple;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.util.MultiValueMapAdapter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MovieSessionService {

    private MovieRepository movieRepo;
    private MovieSessionTupleRepository sessionRepo;

    public MovieSessionService(@Autowired MovieRepository movieRepo, @Autowired MovieSessionTupleRepository sessionRepo) {
        this.movieRepo = movieRepo;
        this.sessionRepo = sessionRepo;
    }

    public Mono<MovieSession> findById(long id){
        return sessionRepo.findById(id)
                .flatMap(tuple -> {
                    return movieRepo.findById(tuple.getMovieId())
                            .map(movie -> toMovieSession(movie, tuple));
                });
    }

    public Flux<MovieSession> findAll(){
        return sessionRepo.findAll()
                // collect all then
                // map movieId to list of movie session that plan that movie
                .collectMultimap(MovieSessionTuple::getMovieId)
                .flatMapMany( sessionMap -> {
                    // find all the movies
                    return movieRepo.findAllById(sessionMap.keySet())
                            .flatMap( movie -> {
                                // merge the movies with the sessions
                                List<MovieSession> sessions = sessionMap.get(movie.getId())
                                        .stream()
                                        .map(movieSessionTuple -> toMovieSession(movie, movieSessionTuple))
                                        .collect(Collectors.toList());

                                return Flux.fromIterable(sessions);
                            });
                });
    }


    private MovieSession toMovieSession(Movie movie, MovieSessionTuple tuple){
        return new MovieSession(
                tuple.getId(),
                movie,
                tuple.getTheater(),
                tuple.getStartTime());
    }
}
