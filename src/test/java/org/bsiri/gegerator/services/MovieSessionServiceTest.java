package org.bsiri.gegerator.services;

import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.domain.MovieSession;
import org.bsiri.gegerator.domain.Theater;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.repositories.MovieSessionTuple;
import org.bsiri.gegerator.repositories.MovieSessionTupleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.MockitoAnnotations;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.time.LocalDateTime;


public class MovieSessionServiceTest {

    AutoCloseable mockClosable;

    @Mock
    MovieSessionTupleRepository sessionRepo;
    @Mock
    MovieRepository movieRepo;

    MovieSessionService service;

    @BeforeEach
    public void setup(){
        mockClosable = MockitoAnnotations.openMocks(this);
        service = new MovieSessionService(movieRepo, sessionRepo);


        when(sessionRepo.findById(10L)).thenReturn(Mono.just(
           sessionBloodFreakCasino()
        ));

        when(movieRepo.findById(1L)).thenReturn(Mono.just(
            movieBloodFreak()
        ));

    }

    @AfterEach
    public void teardown() throws Exception{
        mockClosable.close();
    }

    @Test
    public void shouldFindById(){
        service.findById(10L).as(StepVerifier::create)
                .expectNext(
                    new MovieSession(10L, movieBloodFreak(), Theater.CASINO, date("2022-04-01T08:00:00"))
                )
                .verifyComplete();
    }


    private static Movie movieBloodFreak(){
        return new Movie("Blood Freak", duration("PT1H26M"));
    }

    private static MovieSessionTuple sessionBloodFreakCasino(){
        MovieSessionTuple tuple = new MovieSessionTuple(1L, Theater.CASINO, date("2022-04-01T08:00:00"));
        tuple.setId(10L);
        return tuple;
    }

    private static LocalDateTime date(String strDate){
        return LocalDateTime.parse(strDate);
    }

    private static Duration duration(String duration){ return Duration.parse(duration);}
}
