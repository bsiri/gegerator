package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.domain.AppState;
import org.bsiri.gegerator.services.AppStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController("appstate-controller")
@RequestMapping(path = "/app-state", produces = MediaType.APPLICATION_JSON_VALUE)
public class AppStateController {

    private AppStateService service;

    public AppStateController(@Autowired AppStateService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Mono<AppState>> dump(){
        return ResponseEntity.ok(service.dumpAppState());
    }

    @PostMapping
    public ResponseEntity<Void> load(@RequestBody AppState appState){
        service.loadAppState(appState);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
