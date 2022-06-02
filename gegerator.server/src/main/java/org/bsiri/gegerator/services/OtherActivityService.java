package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.OtherActivity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OtherActivityService {
    Mono<OtherActivity> findById(Long id);

    Flux<OtherActivity> findAll();

    Mono<OtherActivity> save(OtherActivity activity);

    Mono<OtherActivity> update(OtherActivity activity);

    Mono<Void> deleteById(long id);

    Mono<Void> deleteAll();
}
