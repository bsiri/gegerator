package org.bsiri.gegerator.repositories;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.testinfra.DatasetLoader;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Assertions;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.r2dbc.core.DatabaseClient;
import reactor.test.StepVerifier;

import java.time.Duration;


public class MovieRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    DatasetLoader dsLoader;

    @Autowired
    MovieRepository repo;

    @Autowired
    DatabaseClient client;

    @Test
    @SqlDataset("datasets/movie-repo/discopath.sql")
    public void shouldFindByName(){
        dsLoader.load("datasets/movie-repo/discopath.sql");

        repo.findByTitle("Discopath").as(StepVerifier::create)
                .assertNext(movie -> {
                    assertEquals(Duration.parse("PT1H26M") ,movie.getDuration());
                    assertNotNull(movie.getId());
                    assertEquals("Discopath", movie.getTitle());
                })
                .verifyComplete();
    }


    @Test
    public void shouldInsertThenFetch(){
        String title = "From Dusk Till Dawn";
        Movie movie = new Movie(title, Duration.ofMinutes(108));

        repo.save(movie).block();

        repo.findByTitle(title)
            .as(StepVerifier::create)
            .assertNext(m -> {
                Assertions.assertEquals(title, m.getTitle());
            })
            .verifyComplete();

    }

    @Test
    public void moviesShouldHaveUniqueNames(){
        String title = "Snakes on a plane";
        Movie movie = new Movie(title, Duration.ofMinutes(106));

        repo.save(movie).block();

        Movie clone = new Movie(title, Duration.ofMinutes(106));
        repo.save(clone)
            .as(StepVerifier::create)
                .expectError()
                .verify();
    }

    @Test
    @SqlDataset("datasets/movie-repo/discopath.sql")
    public void shouldDelete(){
        dsLoader.load("datasets/movie-repo/discopath.sql");

        Movie discopath = repo.findByTitle("Discopath").block();
        repo.delete(discopath).block();

        repo.findByTitle("Discopath")
                .as(StepVerifier::create)
                .expectNextCount(0)
                .verifyComplete();
    }

    // *************** Datasets ***********************




}
