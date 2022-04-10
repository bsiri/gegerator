package org.bsiri.gegerator.services;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.exceptions.DuplicateNameException;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

@ExtendWith(MockitoExtension.class)
public class MovieServiceTest {

    @Mock
    private MovieRepository repo;

    private MovieService service;

    @BeforeEach
    public void setup(){
        service = new MovieService(repo);
    }

    @Test
    public void shouldHandleDatabaseExceptionsOnCreateOrUpdate(){
        when(repo.save(any(Movie.class)))
                .thenReturn(Mono.error(new
                        DataIntegrityViolationException("Hey, that's not legal !")
                ));

        service.save(new Movie("whatever", Duration.ofMinutes(15)))
                .as(StepVerifier::create)
                .expectError(DuplicateNameException.class)
                .verify();

        service.update(new Movie("whatever", Duration.ofMinutes(15)))
                .as(StepVerifier::create)
                .expectError(DuplicateNameException.class)
                .verify();    }

}














