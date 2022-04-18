import { MovieSession } from "src/app/models/session.model";
import { Movie } from "src/app/models/movie";
import { OtherActivity } from "src/app/models/activity.model";

export interface AppState{
    movielist: ReadonlyArray<Movie>,
    sessionList: ReadonlyArray<MovieSession>,
    activityList: ReadonlyArray<OtherActivity>
}