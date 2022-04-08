import { createFeatureSelector } from "@ngrx/store";
import { Movie } from "../../models/movie";


export const selectMovistlist = createFeatureSelector<ReadonlyArray<Movie>>('movielist');

/*
    TODO : for movie planning, read about 'createSelector' which can create model objects 
    derived from base objects in the store:
    https://ngrx.io/guide/store/walkthrough section src/app/state/books.selectors.ts
*/