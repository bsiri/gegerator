import { createFeatureSelector } from "@ngrx/store";
import { Movie } from "../../models/movie.model";


export const selectMovies = createFeatureSelector<ReadonlyArray<Movie>>('movies');

