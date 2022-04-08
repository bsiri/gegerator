import { createReducer, on } from "@ngrx/store";
import { Movie } from "../../models/movie";
import { MovieActions } from "../actions/movie.actions";

export const initialMovielist: ReadonlyArray<Movie> = []

export const movieReducer = createReducer(
    initialMovielist,
    on(MovieActions.movies_reloaded, 
        (state, {movies}) => 
            movies
        ),
    on(MovieActions.movie_created,
        (state, {movie}) => {
            const newState = state.slice();
            newState.push(movie); 
            return newState;
    })
);