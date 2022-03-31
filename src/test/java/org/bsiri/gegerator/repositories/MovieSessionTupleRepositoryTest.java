package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.testinfra.SqlDataset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

/*
 * Remember : this class uses @SqlDataset, which works thanks to AspectJ.
 * So this class needs to be woven (compile-time here).
 *
 * The Maven build takes care of that, but for it to work from the IDE
 * launcher you need to configure your JUnit tasks to run
 * 'mvn test-compile' before executing the tests.
 */
public class MovieSessionTupleRepositoryTest extends AbstractRepositoryTest{

    @Autowired
    MovieSessionTupleRepository repo;

    @Test
    @SqlDataset("datasets/moviesession-repo/planned-movies.sql")
    public void shouldFindByMovieId(){
        repo.findAllByMovieId(1L).as(StepVerifier::create)
                .expectNext(
                    new MovieSessionTuple(1L, Theater.ESPACE_LAC, parseDate("2022-03-26T10:50:00")),
                    new MovieSessionTuple(1L, Theater.CASINO, parseDate("2022-03-26T13:00:00"))
                )
                .verifyComplete();
    }



    private static LocalDateTime parseDate(String strDate){
        return LocalDateTime.parse(strDate);
    }

}
