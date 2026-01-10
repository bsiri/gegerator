package org.bsiri.gegerator.services.impl;


import org.assertj.core.util.Lists;
import org.bsiri.gegerator.config.AppState;
import org.bsiri.gegerator.config.WizardConfiguration;
import org.bsiri.gegerator.domain.*;
import org.bsiri.gegerator.services.AppStateService;
import org.hamcrest.Matchers;
import static org.hamcrest.MatcherAssert.assertThat;

import org.bsiri.gegerator.testinfra.SqlDataset;
import org.hamcrest.Matcher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.r2dbc.core.DatabaseClient;
import reactor.test.StepVerifier;


import java.lang.reflect.Method;
import java.util.Collection;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.ToLongFunction;

import static org.bsiri.gegerator.testinfra.TestBeans.*;


public class AppStateServiceImplTest extends AbstractDBBasedServiceTest{

    @Autowired
    private AppStateService service;

    @Autowired
    private DatabaseClient client;

    @Test
    @SqlDataset("datasets/generic-datasets/appstate.sql")
    public void shouldDumpAppState(){
        AppState expected = newAppState();

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

        AppState state = newAppState();

        /// //////////////////////////////////////
        // 1. Test that entities are indeed reloaded
        // load, block (simulates end of thread), then dump again and check it all went well.
        service.loadAppState(state).block();

        service.dumpAppState().as(StepVerifier::create)
            .assertNext( appState -> {
                assertThat(appState.getMovies(), containsInAnyOrder(state.getMovies()));
                assertThat(appState.getSessions(), containsInAnyOrder(state.getSessions()));
                assertThat(appState.getActivities(), containsInAnyOrder(state.getActivities()));
            }).verifyComplete();

        /// /////////////////////////////////////
        // 2. also test that identity sequence generator are reset accordingly
        // (ie, next sequence item is set to max(id)+1)


        // retrieve the next identity generator from the schema metadata
        record RowResult(String tableName,
                         Long nextSequenceID) {};
        var tableGenerators = client.sql("""
                select
                    TABLE_NAME as tableName,
                    IDENTITY_BASE as nextSequenceID
                from
                    INFORMATION_SCHEMA.COLUMNS
                where
                    COLUMN_NAME='ID';
                """
                ).mapProperties(RowResult.class)
                .all()
                .collectMap(RowResult::tableName, RowResult::nextSequenceID);

        // collect the max ids from the dataset
        long maxMovieId = maxId(state.getMovies(),Movie::getId);
        long maxSessionID = maxId(state.getSessions(), MovieSession::getId);
        long maxActivityID = maxId(state.getActivities(), OtherActivity::getId);

        // now compare the content of the database with these max ids
        tableGenerators.as(StepVerifier::create)
                .assertNext( tableGens -> {
                    assertThat(
                            "Next Movie ID is greater than max current Movie ID",
                            maxMovieId < tableGens.get("MOVIE")
                    );
                    assertThat(
                            "Next Session ID is greater than max current Session ID",
                            maxSessionID < tableGens.get("MOVIE_SESSION")
                    );
                    assertThat(
                            "Next Activity ID is greater than max current Activity ID",
                            maxActivityID < tableGens.get("OTHER_ACTIVITY")
                    );

                }).verifyComplete();

    }

    // ********* boilerplate ***********

    private AppState newAppState(){
        WizardConfiguration wizconf = new WizardConfiguration();
        List<Movie> movies = Lists.list(decapitron(), tremors(), halloween(), theMist());
        List<MovieSession> sessions = Lists.list(thursdayDecapitron(),
                saturdayDecapitron(),
                sundayHalloween(),
                fridayTremors());

        List<OtherActivity> activities = Lists.list(thursdayGeromoise(), saturdaySoupeAuChoux());

        AppState state = new AppState(wizconf, movies, sessions, activities);
        return state;
    }

    private <T> Matcher<Iterable<? extends T>> containsInAnyOrder(Collection<T> expected){
        T[] array = (T[]) expected.toArray();
         return Matchers.containsInAnyOrder(array);
    }

    private <T> Long maxId(Collection<T> entities, ToLongFunction<T> extractor){
        return entities.stream().mapToLong(extractor).max().orElseThrow();
    }

}
