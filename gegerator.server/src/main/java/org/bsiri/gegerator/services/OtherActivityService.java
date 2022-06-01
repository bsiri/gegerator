package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.OtherActivity;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OtherActivityService {
    Mono<OtherActivity> findById(Long id);

    Flux<OtherActivity> findAll();

    @Transactional
    Mono<OtherActivity> save(OtherActivity activity);

    @Transactional
    Mono<OtherActivity> update(OtherActivity activity);

    @Transactional
    Mono<Void> deleteById(long id);

    @Transactional
    Mono<Void> deleteAll();
}
