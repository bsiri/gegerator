package org.bsiri.gegerator.repositories;

import org.bsiri.gegerator.domain.EventRating;
import org.bsiri.gegerator.testinfra.SqlDataset;
import static org.bsiri.gegerator.testinfra.TestBeans.*;

import static org.hamcrest.MatcherAssert.assertThat;

import static org.hamcrest.Matchers.*;
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


    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldResetSessionRatingForTremors(){
        // The Tremor session of Friday used to be mandatory,
        // now it is default.
        repo.resetRatingsForSessionOfMovie(tremors().getId())
        // Refetch so we can test our assertion.
        .then(repo.findById(fridayTremors().getId()))
        .as(StepVerifier::create)
        .assertNext(movie -> assertThat(movie.getRating(), equalTo(EventRating.DEFAULT)))
        .verifyComplete();
    }
}
