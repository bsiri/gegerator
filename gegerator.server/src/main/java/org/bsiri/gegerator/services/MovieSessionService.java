package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.repositories.MovieSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;

@Service
public class MovieSessionService {

    private MovieSessionRepository sessionRepo;

    public MovieSessionService(@Autowired MovieSessionRepository sessionRepo) {
        this.sessionRepo = sessionRepo;
    }

    public Mono<MovieSession> findById(long id){
        return sessionRepo.findById(id);
    }

    public Flux<MovieSession> findAll(){
        return sessionRepo.findAll();
    }

    @Transactional
    public Mono<MovieSession> save(MovieSession movieSession){
        return sessionRepo.save(movieSession);
    }

    @Transactional
    public void saveAll(Collection<MovieSession> sessions){
        sessionRepo.saveAll(sessions);
    }

    @Transactional
    public Mono<MovieSession> update(MovieSession movieSession){
        return sessionRepo.save(movieSession);
    }

    @Transactional
    public Mono<Void> deleteById(long id){ return sessionRepo.deleteById(id); }


}
