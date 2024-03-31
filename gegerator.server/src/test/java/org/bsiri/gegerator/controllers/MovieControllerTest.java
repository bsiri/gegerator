package org.bsiri.gegerator.controllers;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieRating;
import org.bsiri.gegerator.exceptions.DuplicateNameException;
import org.bsiri.gegerator.services.MovieService;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

import java.time.Duration;

@WebFluxTest(controllers = MovieController.class)
public class MovieControllerTest {

    @MockBean
    private MovieService service;

    @Autowired
    private WebTestClient client;

    @Test
    public void shouldCreateMovie(){
        Movie carnosaur = movie(null, "Carnosaur", "PT1H29M", MovieRating.NEVER);

        client.post().uri("/api/movies")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(carnosaur))
                .exchange()
                .expectStatus()
                    .isCreated();

        verify(service, times(1)).save(carnosaur);
    }

    @Test
    public void shouldRefuseToCreateMovie(){
        Movie carnosaur = movie(null, "Carnosaur", "PT1H29M", MovieRating.NEVER);

        when(service.save(carnosaur)).thenReturn(Mono.error(new DuplicateNameException("Carnosaur")));

        client.post().uri("/api/movies")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(carnosaur))
                .exchange()
                .expectStatus()
                    .isEqualTo(HttpStatus.PRECONDITION_FAILED)
                .expectBody()
                    .json("\"Ce nom est déjà pris : Carnosaur\"");

    }

    @Test
    public void shouldFindOneMovie(){
        Long flyId = 10L;
        String flyTitle = "The Fly";
        String flyDuration = "PT1H36M";
        MovieRating flyRating = MovieRating.HIGHEST;
        Movie theFly = movie(flyId, flyTitle, flyDuration, flyRating);

        when(service.findById(flyId)).thenReturn(Mono.just(theFly));

        client.get().uri("/api/movies/"+flyId)
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus()
                    .isOk()
                .expectBody()
                    .jsonPath("$.id").isEqualTo(flyId)
                    .jsonPath("$.title").isEqualTo(flyTitle)
                    .jsonPath("$.duration").isEqualTo(flyDuration)
                    .jsonPath("$.rating").isEqualTo(flyRating.toString());

        verify(service, times(1)).findById(flyId);
    }


    // ************ boilerplate ****************

    private Movie movie(Long id, String title, String duration, MovieRating rating){
        return Movie.of(id, title, Duration.parse(duration), rating);
    }

}
