package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.testinfra.SqlDataset;
import static org.bsiri.gegerator.testinfra.TestBeans.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;


public class MovieSessionRepositoryTest extends AbstractRepositoryTest{

    @Autowired
    MovieSessionRepository repo;

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldFindByMovieId(){
        repo.findAllByMovieId(decapitron().getId()).as(StepVerifier::create)
                .expectNext(
                    thursdayDecapitron(),
                    saturdayDecapitron()
                )
                .verifyComplete();
    }


}
