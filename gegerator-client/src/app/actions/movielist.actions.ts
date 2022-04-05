import { createAction, props } from "@ngrx/store";
import { Movie } from "../models/movie";

export namespace MovieListActions{
    // Actions outbound to server (handled by MovieListEffects)
    export const create_movie = createAction('[MovieList Component] create', props<{movie: Movie}>());
    export const reload_movies = createAction('[MovieList Component] reload');

    // Actions that should update (handled by the reducers)
    export const movie_created = createAction('[MovieList Component] created', props<{movie: Movie}>());
    export const movies_reloaded = createAction('[MovieList Component] reloaded', props<{movies: Movie[]}>());
}
