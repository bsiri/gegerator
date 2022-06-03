package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.PlannableEvent;
import reactor.core.publisher.Flux;

import java.util.List;

public interface WizardService {
    /**
     * Returns a flux that never completes; items
     * in that flux are the best Roadmaps as determined by
     * the Wizard (a Roadmap being a collection of things to do).
     *
     * @return
     */
    Flux<List<PlannableEvent>> streamBestRoadmap();
}
