package org.bsiri.gegerator.services;

import org.bsiri.gegerator.config.WizardConfiguration;
import reactor.core.publisher.Mono;

public interface ConfigurationService {
    Mono<WizardConfiguration> getWizardConfiguration();

    Mono<WizardConfiguration> setWizardConfiguration(WizardConfiguration wizconf);
}
