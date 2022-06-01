package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.PlannableEvent;
import reactor.core.publisher.Mono;

import java.util.List;

public interface WizardService {
    Mono<List<PlannableEvent>> findBestRoadmap();
}
