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
import org.springframework.util.ReflectionUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.lang.reflect.Field;
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
    public void setup() {
        mockClosable = MockitoAnnotations.openMocks(this);
        service = new MovieSessionService(movieRepo, sessionRepo);


        when(sessionRepo.findById(10L)).thenReturn(Mono.just(
                sessionBloodFreakCasino()
        ));
        when(sessionRepo.findAllByMovieId(1L)).thenReturn(Flux.just(
                sessionBloodFreakCasino(), sessionBloodFreakMCL()
        ));
        when(sessionRepo.findAllByMovieId(2L)).thenReturn(Flux.just(
                sessionScannersParadiso(), sessionScannersCasino(), sessionScannersLac()
        ));

        when(movieRepo.findById(1L)).thenReturn(Mono.just(
                movieBloodFreak()
        ));
        when(movieRepo.findById(2L)).thenReturn(Mono.just(
                movieScanners()
        ));
        when(movieRepo.findAllPlannedInSession()).thenReturn(Flux.just(
                movieBloodFreak(), movieScanners()
        ));

    }

    @AfterEach
    public void teardown() throws Exception {
        mockClosable.close();
    }

    @Test
    public void shouldFindById() {
        service.findById(10L).as(StepVerifier::create)
                .expectNext(
                    sessionOf(movieBloodFreak(), sessionBloodFreakCasino())
                )
                .verifyComplete();
    }

    @Test
    public void shouldFindAll() {
        service.findAll().as(StepVerifier::create)
                .expectNext(
                    sessionOf(movieBloodFreak(), sessionBloodFreakCasino()),
                    sessionOf(movieBloodFreak(), sessionBloodFreakMCL()),

                    sessionOf(movieScanners(), sessionScannersParadiso()),
                    sessionOf(movieScanners(), sessionScannersCasino()),
                    sessionOf(movieScanners(), sessionScannersLac())
                )
                .verifyComplete();
    }

    // ***************** datasets *******************************

    private static Movie movieBloodFreak() {
        return movie(1L, "Blood Freak", "PT1H26M");
    }

    private static Movie movieScanners() {
        return movie(2L, "Scanners", "PT1H43M");
    }

    private static MovieSessionTuple sessionBloodFreakCasino() {
        return tuple(10L, 1L, Theater.CASINO, "2022-04-01T08:00:00");
    }

    private static MovieSessionTuple sessionScannersParadiso() {
        return tuple(11L, 2L, Theater.PARADISO, "2022-04-01T13:00:00");
    }

    private static MovieSessionTuple sessionBloodFreakMCL() {
        return tuple(12L, 1L, Theater.MCL, "2022-04-01T23:00:00");
    }

    private static MovieSessionTuple sessionScannersLac() {
        return tuple(13L, 2L, Theater.ESPACE_LAC, "2022-04-03T22:45:00");
    }

    private static MovieSessionTuple sessionScannersCasino() {
        return tuple(14L, 2L, Theater.CASINO, "2022-04-02T09:27:00");
    }

    // **************** helpers *********************************

    private static LocalDateTime date(String strDate) {
        return LocalDateTime.parse(strDate);
    }

    private static Duration duration(String duration) {
        return Duration.parse(duration);
    }

    private static MovieSessionTuple tuple(Long thisId, Long movieId, Theater theater, String when) {
        MovieSessionTuple tuple = new MovieSessionTuple(movieId, Theater.CASINO, date(when));
        tuple.setId(thisId);
        return tuple;
    }

    private static Movie movie(Long movieId, String title, String duration) {
        Field id = ReflectionUtils.findField(Movie.class, "id");
        ReflectionUtils.makeAccessible(id);
        Movie m = new Movie(title, duration(duration));
        ReflectionUtils.setField(id, m, movieId);
        return m;
    }

    private static MovieSession sessionOf(Movie movie, MovieSessionTuple tuple) {
        return new MovieSession(
                tuple.getId(),
                movie,
                tuple.getTheater(),
                tuple.getStartTime()

        );
    }
}
