import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Movie } from "src/app/models/movie.model";
import { MovieSession, PlannedMovieSession } from "src/app/models/session.model";
import { selectMovieslist } from "./movie.selectors";

interface MoviesById{[id: number]: Movie}

export const selectSessionList = createFeatureSelector<ReadonlyArray<MovieSession>>('sessions')

export const indexedMoviesSelector = createSelector(
    selectMovieslist,
    (movies)  => {
        const result = {} as MoviesById
        movies.forEach(m => result[m.id] = m);
        return result;
});


export const selectPlannedMovieSession = createSelector(
    indexedMoviesSelector,
    selectSessionList,
    (indexedMovies, sessions) => {
        /*
            Note : there is a chance that a session exists but not the movie:
            - either race condition on page load, because the sessions can have finished loading
              before the movies do,
            - or a movie was deleted but its session objects still live in memory.

            In these cases we must take care of not returning a session if the movie 
            does not exist anymore.
        */
        const allMovieIds = Object.keys(indexedMovies).map(kId => parseInt(kId))
        const plannedSessions = sessions
            .filter(s => allMovieIds.includes(s.movieId))
            .map(s =>
                new PlannedMovieSession(s.id, indexedMovies[s.movieId], s.theater, s.day, s.startTime)
            );
        return plannedSessions;
});

