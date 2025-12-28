package org.bsiri.gegerator.repositories;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieRating;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Assertions;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;
import static org.bsiri.gegerator.testinfra.TestBeans.*;

import java.time.Duration;


public class MovieRepositoryTest  extends AbstractRepositoryTest {

    @Autowired
    MovieRepository repo;

    @Test
    @SqlDataset("datasets/movie-repo/discopath.sql")
    public void shouldFindByTitle(){
        repo.findByTitle("Discopath").as(StepVerifier::create)
                .assertNext(movie -> {
                    assertEquals(new Movie("Discopath", Duration.parse("PT1H26M"), MovieRating.DEFAULT), movie);
                })
                .verifyComplete();
    }

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldFindAll(){
        repo.findAll().as(StepVerifier::create).expectNext(
            decapitron(),
            tremors(),
            halloween(),
            theMist()
        )
        .verifyComplete();
    }

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldFindOnlyPlanned(){
        repo.findAllPlannedInSession().as(StepVerifier::create).expectNext(
            decapitron(),
            tremors(),
            halloween()
            // Note : the fourth movie (The Mist) is not planned
        )
        .verifyComplete();
    }

    @Test
    public void shouldInsertThenFetch(){
        String title = "From Dusk Till Dawn";
        Movie movie = Movie.of(null, title, Duration.ofMinutes(108), MovieRating.HIGH);

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
        Movie movie = Movie.of(null, title, Duration.ofMinutes(106), MovieRating.DEFAULT);

        repo.save(movie).block();

        Movie clone = Movie.of(null, title, Duration.ofMinutes(180), MovieRating.HIGH);
        repo.save(clone)
            .as(StepVerifier::create)
                .expectError()
                .verify();
    }

    @Test
    @SqlDataset("datasets/movie-repo/discopath.sql")
    public void shouldDelete(){

        Movie discopath = repo.findByTitle("Discopath").block();
        repo.delete(discopath).block();

        repo.findByTitle("Discopath")
                .as(StepVerifier::create)
                .expectNextCount(0)
                .verifyComplete();
    }

}
