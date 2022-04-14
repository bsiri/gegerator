package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Day;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.time.LocalTime;


public class MovieSessionRepositoryTest extends AbstractRepositoryTest{

    @Autowired
    MovieSessionRepository repo;

    @Test
    @SqlDataset("datasets/moviesession-repo/planned-movies.sql")
    public void shouldFindByMovieId(){
        repo.findAllByMovieId(1L).as(StepVerifier::create)
                .expectNext(
                    new MovieSession(1L, Theater.ESPACE_LAC, Day.FRIDAY , time("10:50:00")),
                    new MovieSession(1L, Theater.CASINO, Day.THURSDAY, time("13:00:00"))
                )
                .verifyComplete();
    }

    private static LocalTime time(String strTime){
        return LocalTime.parse(strTime);
    }

}
