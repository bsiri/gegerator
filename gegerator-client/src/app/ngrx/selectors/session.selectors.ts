import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Movie } from "src/app/models/movie";
import { MovieSession, PlannedMovieSession } from "src/app/models/session.model";
import { selectMovieslist } from "./movie.selectors";

interface MoviesById{[id: number]: Movie}

export const selectSessionList = createFeatureSelector<ReadonlyArray<MovieSession>>('sessionList')

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
        const plannedSessions = sessions.map(s => {
           return new PlannedMovieSession(s.id, indexedMovies[s.movieId], s.theater, s.day, s.startTime)
        });
        return plannedSessions;
});

