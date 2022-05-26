package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.services.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;



@RestController("configuration-controller")
@RequestMapping(path = "/configuration", produces = MediaType.APPLICATION_JSON_VALUE)
public class ConfigurationController {

    private ConfigurationService service;

    public ConfigurationController(@Autowired ConfigurationService service) {
        this.service = service;
    }

    @GetMapping("/wizard")
    public ResponseEntity<Mono<WizardConfiguration>> getWizardConfiguration(){
        return ResponseEntity.status(HttpStatus.OK).body(service.getWizardConfiguration());
    }

    @PutMapping(value = "/wizard", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Mono<WizardConfiguration>> saveWizardConfiguration(
            @RequestBody WizardConfiguration wizardConfiguration
    ){
        return ResponseEntity.status(HttpStatus.OK).body(
                service.setWizardConfiguration(wizardConfiguration
                )
        );
    }
}
