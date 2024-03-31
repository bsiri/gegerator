package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.domain.PlannableEvent;
import org.bsiri.gegerator.services.WizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/wizard")
public class WizardController {

    private WizardService wizardService;

    public WizardController(@Autowired WizardService wizardService) {
        this.wizardService = wizardService;
    }

    @GetMapping(path="/roadmap", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<PlannableEvent>> getBestRoadmap(){
        return wizardService.streamBestRoadmap();
    }

}
