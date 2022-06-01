package org.bsiri.gegerator.services;

import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.services.aspect.FireModelChanged;
import org.bsiri.gegerator.services.events.WizardConfChangedEvent;
import reactor.core.publisher.Mono;

public interface ConfigurationService {
    Mono<WizardConfiguration> getWizardConfiguration();

    @FireModelChanged(WizardConfChangedEvent.class)
    Mono<WizardConfiguration> setWizardConfiguration(WizardConfiguration wizconf);
}
