import { createAction, props } from "@ngrx/store";
import { Movie } from "../../models/movie";


export namespace MovieActions{
    // Actions consumed by effects
    export const create_movie = createAction('[Movie] create', props<{movie: Movie}>());
    export const reload_movies = createAction('[Movie] reload');
    export const update_movie_title = createAction('[Movie] update title', props<{movie: Movie}>());
    export const update_movie_duration = createAction('[Movie] update duration', props<{movie: Movie}>());
    export const delete_movie = createAction('[Movie] delete', props<{movie: Movie}>());
    
    // Actions consumed by reducers
    export const movie_created = createAction('[MovieList] created', props<{movie: Movie}>());
    export const movies_reloaded = createAction('[MovieList] reloaded', props<{movies: Movie[]}>());
    export const movie_title_updated = createAction('[Movie] title updated', props<{movie: Movie}>());
    export const movie_duration_updated = createAction('[Movie] duration updated', props<{movie: Movie}>());
    export const movie_deleted = createAction('[Movie] deleted', props<{movie: Movie}>());
    
}
