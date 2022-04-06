import { createAction, props } from "@ngrx/store";
import { Movie } from "../../models/movie";



const update_movie_title = createAction('[Movie Component] update title', props<{movie: Movie}>());
const update_movie_duration = createAction('[Movie Component] update duration', props<{movie: Movie}>());
const delete_movie = createAction('[Movie Component] delete', props<{movie: Movie}>());

