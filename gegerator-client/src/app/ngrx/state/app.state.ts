import { RawSession } from "src/app/models/session.model";
import { Movie } from "src/app/models/movie";

export interface AppState{
    movielist: ReadonlyArray<Movie>,
    rawSessionList: ReadonlyArray<RawSession>
}