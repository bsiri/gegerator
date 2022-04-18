import { createReducer, on } from "@ngrx/store";
import { Movie } from "../../models/movie.model";
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
    }),
    on(MovieActions.movie_updated,
        (state, {movie}) => {
            const newState = state.slice();
            const movieIndex = newState.findIndex( m => m.id == movie.id)
            newState.splice(movieIndex, 1, movie);
            return newState;            
    }),
    on(MovieActions.movie_deleted,
        (state, {movie}) => {
            return state.filter( m=> m.id != movie.id);
        }    
    )
);