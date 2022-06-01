package org.bsiri.gegerator.services.impl;

import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.services.ConfigurationService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;



@Service
public class ConfigurationServiceImpl implements ConfigurationService {

    volatile private WizardConfiguration wizardConfiguration = new WizardConfiguration();

    public ConfigurationServiceImpl(){
    }

    @Override
    public Mono<WizardConfiguration> getWizardConfiguration(){
        return Mono.just(wizardConfiguration);
    }

    @Override
    public Mono<WizardConfiguration> setWizardConfiguration(WizardConfiguration wizconf){
        this.wizardConfiguration = wizconf;
        return Mono.just(wizardConfiguration);
    }

}
