import { createAction, props } from "@ngrx/store";
import { Movie } from "../../models/movie.model";


export namespace MovieActions{
    // Actions consumed by effects
    export const create_movie = createAction('[Movie] create', props<{movie: Movie}>());
    export const reload_movies = createAction('[Movie] reload');
    export const update_movie = createAction('[Movie] update', props<{movie: Movie}>());
    export const delete_movie = createAction('[Movie] delete', props<{movie: Movie}>());
    
    // Actions consumed by reducers
    export const movie_created = createAction('[MovieList] created', props<{movie: Movie}>());
    export const movies_reloaded = createAction('[MovieList] reloaded', props<{movies: Movie[]}>());
    export const movie_updated = createAction('[Movie] updated', props<{movie: Movie}>());
    export const movie_deleted = createAction('[Movie] deleted', props<{movie: Movie}>());
    
}
