package org.bsiri.gegerator.services;

import org.assertj.core.util.Lists;
import org.bsiri.gegerator.domain.*;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.util.List;

import static java.time.Duration.ofMinutes;
import static java.time.LocalTime.parse;


@ExtendWith(MockitoExtension.class)
public class AppStateServiceTest {

    @Mock(lenient = true)
    private MovieService movieService;

    @Mock(lenient = true)
    private MovieSessionService sessionService;

    @Mock(lenient = true)
    private OtherActivityService activityService;

    private AppStateService service;

    @BeforeEach
    public void setup(){
        service = new AppStateService(movieService, sessionService, activityService);

        when(movieService.findAll()).thenReturn(Flux.just(decapitron(), tremors(), halloween()));
        when(sessionService.findAll()).thenReturn(Flux.just(
                thursdayDecapitron(),
                saturdayDecapitron(),
                sundayHalloween(),
                fridayTremors()
        ));
        when(activityService.findAll()).thenReturn(Flux.just(thursdayGeromoise(), saturdaySoupeAuChoux()));
    }

    @Test
    public void shouldDumpAppState(){
        service.dumpAppState().as(StepVerifier::create)
                .assertNext( appState -> {
                    assertThat(appState.getMovies(), containsInAnyOrder(decapitron(), tremors(), halloween()));
                    assertThat(appState.getSessions(), containsInAnyOrder(thursdayDecapitron(),
                            saturdayDecapitron(),
                            sundayHalloween(),
                            fridayTremors()));
                    assertThat(appState.getActivities(), containsInAnyOrder(thursdayGeromoise(), saturdaySoupeAuChoux()));
                }).verifyComplete();
    }

    @Test
    public void shouldLoadAppState(){
        List<Movie> movies = Lists.list(decapitron(), tremors(), halloween());
        List<MovieSession> sessions = Lists.list(thursdayDecapitron(),
                saturdayDecapitron(),
                sundayHalloween(),
                fridayTremors());

        List<OtherActivity> activities = Lists.list(thursdayGeromoise(), saturdaySoupeAuChoux());

        AppState state = new AppState(movies, sessions, activities);

        service.loadAppState(state);

        verify(movieService).saveAll(movies);
        verify(sessionService).saveAll(sessions);
        verify(activityService).saveAll(activities);
    }

    // ********* boilerplate **************

    private Movie decapitron(){
        return Movie.of(1, "Decapitron", ofMinutes(86));
    }

    private Movie tremors(){
        return Movie.of(2, "Tremors", ofMinutes(96));
    }

    private Movie halloween(){
        return Movie.of(3, "Halloween", ofMinutes(91));
    }

    private MovieSession thursdayDecapitron(){
        return MovieSession.of(1, 1, Theater.ESPACE_LAC, Day.THURSDAY, parse("10:00:00"));
    }

    private MovieSession saturdayDecapitron(){
        return MovieSession.of(2, 1, Theater.MCL, Day.SATURDAY, parse("17:25:00"));
    }

    private MovieSession sundayHalloween(){
        return MovieSession.of(3, 3, Theater.CASINO, Day.SUNDAY, parse("11:15:00"));
    }

    private MovieSession fridayTremors(){
        return MovieSession.of(4, 2, Theater.PARADISO, Day.FRIDAY, parse("13:30:00"));
    }

    private OtherActivity thursdayGeromoise(){
        return OtherActivity.of(1, Day.THURSDAY, parse("19:00:00"), parse("21:00:00"), "Geromoise");
    }

    private OtherActivity saturdaySoupeAuChoux(){
        return OtherActivity.of(2, Day.SATURDAY, parse("20:00:00"), parse("21:30:00"), "Soupe aux Choux");
    }
}
