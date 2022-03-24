package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Movie;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import org.springframework.r2dbc.core.DatabaseClient;
import reactor.test.StepVerifier;

import java.time.Duration;


@DataR2dbcTest
public class MovieRepositoryTest {

    @Autowired
    MovieRepository repo;

    @Autowired
    DatabaseClient client;

    @Test
    public void shouldInsertThenFetch(){
        String title = "From Dusk Till Dawn";
        Movie movie = new Movie(title, Duration.ofMinutes(108));

        repo.save(movie).block();

        repo.findByName(title)
            .as(StepVerifier::create)
            .assertNext(m -> {
                assertEquals(title, m.getName());
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
}
