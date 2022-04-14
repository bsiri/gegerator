import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Movie } from "src/app/models/movie";
import { MovieSession, PlannedMovieSession } from "src/app/models/session.model";
import { selectMovieslist } from "./movie.selectors";



export const selectSessionList = createFeatureSelector<ReadonlyArray<MovieSession>>('sessionList')

export const indexedMoviesSelector = createSelector(
    selectMovieslist,
    (movies)  => {
        const result = {} as [id: number, movie: Movie]
        movies.forEach(m => result[m.id] = m);
        return result;
});


export const selectPlannedMovieSession = createSelector(
    indexedMoviesSelector,
    selectSessionList,
    (indexedMovies, sessions) => {
        const plannedSessions = sessions.map(s => {
            return {
                id: s.id,
                movie: indexedMovies[s.movieId],
                day: s.day,
                startTime: s.startTime,
                theater: s.theater
            } as PlannedMovieSession
        });
        return plannedSessions;
});

