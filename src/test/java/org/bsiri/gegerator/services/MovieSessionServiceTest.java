package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest;
import static org.springframework.test.util.AssertionErrors.*;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

@DataR2dbcTest
public class MovieSessionServiceTest {

    @Autowired
    MovieSessionTupleRepository sessionRepo;

    @Autowired
    MovieRepository movieRepo;

    @Test
    public void shouldInsertThenFetch(){
        MovieSessionService service = new MovieSessionService(movieRepo, sessionRepo);

        Movie decapitron = movieRepo.findByName("Decapitron").block();
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
