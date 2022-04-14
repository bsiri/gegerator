import { createFeatureSelector } from "@ngrx/store";
import { Movie } from "../../models/movie";


export const selectMovistlist = createFeatureSelector<ReadonlyArray<Movie>>('movielist');

