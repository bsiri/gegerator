package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.OtherActivity;
import org.bsiri.gegerator.services.aspect.FireModelChanged;
import org.bsiri.gegerator.services.events.OtherActivitiesChangedEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OtherActivityService {
    Mono<OtherActivity> findById(Long id);

    Flux<OtherActivity> findAll();

    @FireModelChanged(OtherActivitiesChangedEvent.class)
    Mono<OtherActivity> save(OtherActivity activity);

    @FireModelChanged(OtherActivitiesChangedEvent.class)
    Mono<OtherActivity> update(OtherActivity activity);

    @FireModelChanged(OtherActivitiesChangedEvent.class)
    Mono<Void> deleteById(long id);

    @FireModelChanged(OtherActivitiesChangedEvent.class)
    Mono<Void> deleteAll();
}
