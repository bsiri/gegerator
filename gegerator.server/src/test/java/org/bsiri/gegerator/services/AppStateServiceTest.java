package org.bsiri.gegerator.services;


import org.assertj.core.util.Lists;
import org.bsiri.gegerator.domain.*;
import org.hamcrest.Matchers;
import static org.hamcrest.MatcherAssert.assertThat;

import org.bsiri.gegerator.testinfra.SqlDataset;
import org.hamcrest.Matcher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.r2dbc.core.DatabaseClient;
import reactor.test.StepVerifier;


import java.util.Collection;
import java.util.List;
import static org.bsiri.gegerator.testinfra.TestBeans.*;


public class AppStateServiceTest extends AbstractDBBasedServiceTest{

    @Autowired
    private AppStateService service;

    @Autowired
    private DatabaseClient client;

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldDumpAppState(){
        AppState expected = makeAppState();

        service.dumpAppState().as(StepVerifier::create)
                .assertNext( appState -> {
                    assertThat(appState.getMovies(), containsInAnyOrder(expected.getMovies()));
                    assertThat(appState.getSessions(), containsInAnyOrder(expected.getSessions()));
                    assertThat(appState.getActivities(), containsInAnyOrder(expected.getActivities()));
                }).verifyComplete();
    }

    @Test
    @SqlDataset("datasets/appstate-service/to-replace-state.sql")
    public void shouldLoadAppState(){

        AppState state = makeAppState();

        // load, block (simulates end of thread), then dump again and check it all went well.
        service.loadAppState(state).block();

        service.dumpAppState().as(StepVerifier::create)
            .assertNext( appState -> {
                assertThat(appState.getMovies(), containsInAnyOrder(state.getMovies()));
                assertThat(appState.getSessions(), containsInAnyOrder(state.getSessions()));
                assertThat(appState.getActivities(), containsInAnyOrder(state.getActivities()));
            }).verifyComplete();


    }

    // ********* boilerplate ***********

    private AppState makeAppState(){
        List<Movie> movies = Lists.list(decapitron(), tremors(), halloween(), theMist());
        List<MovieSession> sessions = Lists.list(thursdayDecapitron(),
                saturdayDecapitron(),
                sundayHalloween(),
                fridayTremors());

        List<OtherActivity> activities = Lists.list(thursdayGeromoise(), saturdaySoupeAuChoux());

        AppState state = new AppState(movies, sessions, activities);
        return state;
    }

    private <T> Matcher<Iterable<? extends T>> containsInAnyOrder(Collection<T> expected){
        T[] array = (T[]) expected.toArray();
         return Matchers.containsInAnyOrder(array);
    }

}
