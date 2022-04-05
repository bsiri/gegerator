import { createReducer, on } from "@ngrx/store";
import { Movie } from "../models/movie";
import { MovieListActions } from "../actions/movielist.actions";

export const initialMovielist: ReadonlyArray<Movie> = []

export const movielistReducer = createReducer(
    initialMovielist,
    on(MovieListActions.movies_reloaded, 
        (state, {movies}) => 
            movies
        )
);