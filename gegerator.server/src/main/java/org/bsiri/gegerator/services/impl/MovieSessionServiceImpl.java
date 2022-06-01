package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.EventRating;
import org.bsiri.gegerator.repositories.MovieSessionRepository;
import org.bsiri.gegerator.services.MovieSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MovieSessionServiceImpl implements MovieSessionService {

    private MovieSessionRepository sessionRepo;

    public MovieSessionServiceImpl(@Autowired MovieSessionRepository sessionRepo) {
        this.sessionRepo = sessionRepo;
    }

    @Override
    public Mono<MovieSession> findById(long id){
        return sessionRepo.findById(id);
    }

    @Override
    public Flux<MovieSession> findAll(){
        return sessionRepo.findAll();
    }

    /**
     * Updates a MovieSession, paying attention to the following Business Rules:
     *  - If that session has a Rating == MANDATORY, then all other sessions
     *    of the same Movie of Rating MANDATORY now become of Rating DEFAULT.
     *
     * @param movieSession
     * @return
     */
    @Override
    @Transactional
    public Mono<MovieSession> save(MovieSession movieSession){
        Mono<Void> rgUniqueMandatory = Mono.empty();
        if (movieSession.getRating() == EventRating.MANDATORY){
            rgUniqueMandatory = sessionRepo.resetRatingsForSessionOfMovie(movieSession.getMovieId());
        }

        return rgUniqueMandatory.then(sessionRepo.save(movieSession));
    }

    @Override
    @Transactional
    public Mono<MovieSession> update(MovieSession movieSession){
        return save(movieSession);
    }

    @Override
    @Transactional
    public Mono<Void> deleteById(long id){
        return sessionRepo.deleteById(id);
    }

    @Override
    @Transactional
    public Mono<Void> deleteAll(){
        return sessionRepo.deleteAll();
    }

}
