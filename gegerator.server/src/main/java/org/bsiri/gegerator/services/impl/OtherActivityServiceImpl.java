package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.domain.OtherActivity;
import org.bsiri.gegerator.exceptions.TimeParadoxException;
import org.bsiri.gegerator.repositories.OtherActivityRepository;
import org.bsiri.gegerator.services.OtherActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@Service
public class OtherActivityServiceImpl implements OtherActivityService {

    private OtherActivityRepository repo;

    public OtherActivityServiceImpl(@Autowired OtherActivityRepository repo) {
        this.repo = repo;
    }

    @Override
    public Mono<OtherActivity> findById(Long id){
        return repo.findById(id);
    }

    @Override
    public Flux<OtherActivity> findAll(){
        return repo.findAll();
    }

    @Override
    public Mono<OtherActivity> save(OtherActivity activity){
        return repo.save(activity)
                .onErrorMap(DataIntegrityViolationException.class,
                        ex -> new TimeParadoxException(activity.getStartTime(), activity.getEndTime()));
    }

    @Override
    public Mono<OtherActivity> update(OtherActivity activity){
        return save(activity);
    }

    @Override
    public Mono<Void> deleteById(long id){ return repo.deleteById(id); }

    @Override
    public Mono<Void> deleteAll(){
        return repo.deleteAll();
    }
}
