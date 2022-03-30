package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.bsiri.gegerator.testinfra.PersistenceTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import static org.springframework.test.util.AssertionErrors.*;

import org.springframework.test.context.ContextConfiguration;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

/*
    TODO
    Just use plain mocks ? Do I need to inject anything ?
 */
@DataR2dbcTest
@ContextConfiguration(classes = {PersistenceTestConfig.class})
public class MovieSessionServiceTest {

    @Autowired
    MovieSessionTupleRepository sessionRepo;

    @Autowired
    MovieRepository movieRepo;

    @Test
    public void shouldInsertThenFetch(){
        MovieSessionService service = new MovieSessionService(movieRepo, sessionRepo);

        Movie decapitron = movieRepo.findByTitle("Decapitron").block();
        MovieSession session = new MovieSession(
                null,
                decapitron,
                Theater.CASINO,
                LocalDateTime.parse("2022-03-28T10:55:00"));

        service.save(session).as(StepVerifier::create)
                .assertNext(s -> assertNotNull("session had no ID", s.getId()))
                .verifyComplete();
    }





}