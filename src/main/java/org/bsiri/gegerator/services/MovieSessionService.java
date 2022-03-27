package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTuple;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.util.function.UnaryOperator;
import java.util.stream.Stream;

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
                .zipWhen(tuple -> movieRepo.findById(tuple.getMovieId()))
                .map(this::toMovieSessionSwapped);
    }

    public Flux<MovieSession> findAll(){
        return movieRepo.findAllPlannedInSession()
                .flatMap(movie ->
                    Flux.zip(always(movie),
                            sessionRepo.findAllByMovieId(movie.getId())
                    )
                )
                .map(this::toMovieSession);
    }


/*
    This old implementation of findall
    is maybe faster (only two calls to DB)
    but it's such a pita to read that the
    other implementation is now preferred.

    public Flux<MovieSession> findAllOld(){
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
*/

    private MovieSession toMovieSession(Tuple2<Movie, MovieSessionTuple> tuple){
        return toMovieSession(tuple.getT1(), tuple.getT2());
    }

    private MovieSession toMovieSessionSwapped(Tuple2<MovieSessionTuple, Movie> tuple){
        return toMovieSession(tuple.getT2(), tuple.getT1());
    }

    private MovieSession toMovieSession(Movie movie, MovieSessionTuple tuple){
        return new MovieSession(
                tuple.getId(),
                movie,
                tuple.getTheater(),
                tuple.getStartTime());
    }

    private <T> Flux<T> always(T something ){
        return Flux.fromStream(Stream.iterate(something, UnaryOperator.identity()));
    }

}
