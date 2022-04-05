import { Injectable } from "@angular/core";
import { Actions, createEffect, Effect, ofType } from "@ngrx/effects";
import { MovielistService } from "../services/movielist.service";
import { MovieListActions } from "../actions/movielist.actions";
import { map, mergeMap } from "rxjs";
import { Movie } from "../models/movie";

@Injectable()
export class MovieListEffects {

    constructor(
        private actions$: Actions,
        private service: MovielistService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(MovieListActions.reload_movies),
        mergeMap(() => this.service.getAll()
            .pipe(
                map(movies => MovieListActions.movies_reloaded({movies}))
            )
        )
    ));   

}