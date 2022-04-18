package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.OtherActivity;
import org.bsiri.gegerator.exceptions.TimeParadoxException;
import org.bsiri.gegerator.repositories.OtherActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class OtherActivityService {

    private OtherActivityRepository repo;

    public OtherActivityService(@Autowired OtherActivityRepository repo) {
        this.repo = repo;
    }

    public Mono<OtherActivity> findById(Long id){
        return repo.findById(id);
    }

    public Flux<OtherActivity> findAll(){
        return repo.findAll();
    }

    @Transactional
    public Mono<OtherActivity> save(OtherActivity activity){
        return repo.save(activity)
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new TimeParadoxException(activity.getStartTime(), activity.getEndTime()));
    }

    @Transactional
    public Mono<OtherActivity> update(OtherActivity activity){
        return save(activity);
    }

    @Transactional
    public Mono<Void> deleteById(long id){ return repo.deleteById(id); }
}
