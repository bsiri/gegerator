package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.services.MovieSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@RestController("moviesessions-controller")
@RequestMapping(path = "/movie-sessions", produces = MediaType.APPLICATION_JSON_VALUE)
public class MovieSessionController {

    private MovieSessionService service;

    public MovieSessionController(@Autowired MovieSessionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Flux<MovieSession>> findAll(){
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mono<MovieSession>> getById(@PathVariable long id){
        return ResponseEntity.status(HttpStatus.OK).body(service.findById(id));
    }
}
