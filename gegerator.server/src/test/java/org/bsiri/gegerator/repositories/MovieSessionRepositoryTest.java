package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;


public class MovieSessionRepositoryTest extends AbstractRepositoryTest{

    @Autowired
    MovieSessionRepository repo;

    @Test
    @SqlDataset("datasets/moviesession-repo/planned-movies.sql")
    public void shouldFindByMovieId(){
        repo.findAllByMovieId(1L).as(StepVerifier::create)
                .expectNext(
                    new MovieSession(1L, Theater.ESPACE_LAC, date("2022-03-26T10:50:00")),
                    new MovieSession(1L, Theater.CASINO, date("2022-03-26T13:00:00"))
                )
                .verifyComplete();
    }

    private static LocalDateTime date(String strDate){
        return LocalDateTime.parse(strDate);
    }

}
