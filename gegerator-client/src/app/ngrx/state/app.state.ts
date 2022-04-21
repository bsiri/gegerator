import { MovieSession } from "src/app/models/session.model";
import { Movie } from "src/app/models/movie.model";
import { OtherActivity } from "src/app/models/activity.model";

export interface AppState{
    movies: ReadonlyArray<Movie>,
    sessions: ReadonlyArray<MovieSession>,
    activities: ReadonlyArray<OtherActivity>
}