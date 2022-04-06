import { Movie } from "../models/movie";

export interface AppState{
    movielist: ReadonlyArray<Movie>
}