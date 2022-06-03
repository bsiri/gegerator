package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.PlannableEvent;
import reactor.core.publisher.Flux;

import java.util.List;

public interface WizardService {
    Flux<List<PlannableEvent>> bestRoadmapFlux();
}
