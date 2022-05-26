package org.bsiri.gegerator.services;

import org.bsiri.gegerator.config.WizardConfiguration;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;



@Service
public class ConfigurationService {

    volatile private WizardConfiguration wizardConfiguration = new WizardConfiguration();

    public ConfigurationService(){
    }

    public Mono<WizardConfiguration> getWizardConfiguration(){
        return Mono.just(wizardConfiguration);
    }

    public Mono<WizardConfiguration> setWizardConfiguration(WizardConfiguration wizconf){
        this.wizardConfiguration = wizconf;
        return Mono.just(wizardConfiguration);
    }

}
