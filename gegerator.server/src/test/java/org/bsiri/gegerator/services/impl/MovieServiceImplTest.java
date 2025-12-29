package org.bsiri.gegerator.services.impl;


import org.bsiri.gegerator.domain.Movie;
import org.bsiri.gegerator.exceptions.DuplicateNameException;
import org.bsiri.gegerator.repositories.MovieRepository;
import org.bsiri.gegerator.services.MovieService;
import org.bsiri.gegerator.services.impl.MovieServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.bsiri.gegerator.testinfra.TestBeans.*;

@ExtendWith(MockitoExtension.class)
public class MovieServiceImplTest {

    @Mock
    private MovieRepository repo;

    private MovieService service;

    @BeforeEach
    public void setup(){
        service = new MovieServiceImpl(repo);
    }

    @Test
    public void shouldHandleDatabaseExceptionsOnCreateOrUpdate(){
        when(repo.save(any(Movie.class)))
                .thenReturn(Mono.error(new
                        DataIntegrityViolationException("Hey, that's not legal !")
                ));

        service.save(halloween())
                .as(StepVerifier::create)
                .expectError(DuplicateNameException.class)
                .verify();

        service.update(theMist())
                .as(StepVerifier::create)
                .expectError(DuplicateNameException.class)
                .verify();    }

}














