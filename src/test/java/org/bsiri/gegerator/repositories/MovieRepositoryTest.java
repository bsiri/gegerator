package org.bsiri.gegerator.repositories;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Assertions;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import java.time.Duration;


/*
 * Remember : this class uses @SqlDataset, which works thanks to AspectJ.
 * So this class needs to be woven (compile-time here).
 *
 * The Maven build takes care of that, but for it to work from the IDE
 * launcher you need to configure your JUnit tasks to run
 * 'mvn test-compile' before executing the tests.
 */
public class MovieRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    MovieRepository repo;

    @Test
    @SqlDataset("datasets/movie-repo/discopath.sql")
    public void shouldFindByTitle(){
        repo.findByTitle("Discopath").as(StepVerifier::create)
                .assertNext(movie -> {
                    assertEquals(new Movie("Discopath", Duration.parse("PT1H26M")), movie);
                })
                .verifyComplete();
    }

    @Test
    @SqlDataset("datasets/movie-repo/planned-movies.sql")
    public void shouldFindAll(){
        repo.findAll().as(StepVerifier::create).expectNext(
                new Movie("Decapitron", Duration.parse("PT1h36M")),
                new Movie("The Mist", Duration.parse("PT2h6M")),
                new Movie("Fortress", Duration.parse("PT1h35M")),
                new Movie("Bernie", Duration.parse("PT1h27M"))
        )
        .verifyComplete();
    }

    @Test
    @SqlDataset("datasets/movie-repo/planned-movies.sql")
    public void shouldFindOnlyPlanned(){
        repo.findAllPlannedInSession().as(StepVerifier::create).expectNext(
                new Movie("Decapitron", Duration.parse("PT1h36M")),
                new Movie("Fortress", Duration.parse("PT1h35M"))
        )
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

        Movie discopath = repo.findByTitle("Discopath").block();
        repo.delete(discopath).block();

        repo.findByTitle("Discopath")
                .as(StepVerifier::create)
                .expectNextCount(0)
                .verifyComplete();
    }

}
