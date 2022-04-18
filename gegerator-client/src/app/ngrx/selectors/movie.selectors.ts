import { createFeatureSelector } from "@ngrx/store";
import { Movie } from "../../models/movie.model";


export const selectMovieslist = createFeatureSelector<ReadonlyArray<Movie>>('movielist');

