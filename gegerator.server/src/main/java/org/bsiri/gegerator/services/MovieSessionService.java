package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTuple;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public Mono<MovieSession> save(MovieSession movieSession){
        MovieSessionTuple tuple = toTuple(movieSession);
        return sessionRepo.save(tuple).flatMap(t -> {
           movieSession.setId(t.getId());
           return Mono.just(movieSession);
        });
    }


    // ************ Helpers ****************************

    private MovieSession toMovieSession(Tuple2<Movie, MovieSessionTuple> tuple){
        return toMovieSession(tuple.getT1(), tuple.getT2());
    }

    private MovieSession toMovieSessionSwapped(Tuple2<MovieSessionTuple, Movie> tuple){
        return toMovieSession(tuple.getT2(), tuple.getT1());
    }

    private MovieSession toMovieSession(Movie movie, MovieSessionTuple tuple){
        MovieSession ns = new MovieSession(
                movie,
                tuple.getTheater(),
                tuple.getStartTime());
        ns.setId(tuple.getId());
        return ns;
    }

    private MovieSessionTuple toTuple(MovieSession movieSession){
        MovieSessionTuple tuple = new MovieSessionTuple(
            movieSession.getMovie().getId(),
                movieSession.getTheater(),
                movieSession.getStartTime()
        );
        tuple.setId(movieSession.getId());
        return tuple;
    }

    private <T> Flux<T> always(T something ){
        return Flux.fromStream(Stream.iterate(something, UnaryOperator.identity()));
    }

}
