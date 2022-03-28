package org.bsiri.gegerator.controllers;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.services.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController("movies-controller")
@RequestMapping(path = "/movies", produces = MediaType.APPLICATION_JSON_VALUE)
public class MovieController {

    private MovieService service;

    public MovieController(@Autowired MovieService service){
        this.service = service;
    }

    @GetMapping()
    public ResponseEntity<Flux<Movie>> findAll(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mono<Movie>> getById(@PathVariable long id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.findById(id));
    }

    @PutMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody Movie movie){
        service.save(movie);
    }

}
