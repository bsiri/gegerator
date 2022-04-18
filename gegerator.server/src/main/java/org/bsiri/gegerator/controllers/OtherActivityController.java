package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.domain.OtherActivity;
import org.bsiri.gegerator.services.OtherActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@RestController("otheractivities-controller")
@RequestMapping(path = "/other-activities", produces = MediaType.APPLICATION_JSON_VALUE)
public class OtherActivityController {

    private OtherActivityService service;

    public OtherActivityController(@Autowired OtherActivityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Flux<OtherActivity>> findAll(){
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mono<OtherActivity>> getById(@PathVariable long id){
        return ResponseEntity.status(HttpStatus.OK).body(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Mono<OtherActivity>> create(@RequestBody OtherActivity activity){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(activity));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Mono<OtherActivity>> update(@RequestBody OtherActivity activity){
        return ResponseEntity.status(HttpStatus.OK).body(service.update(activity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Mono<Void>> delete(@PathVariable long id){
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(service.deleteById(id));
    }
}
