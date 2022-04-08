import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MovielistService } from "../../services/movielist.service";
import { MovieListActions } from "../actions/movielist.actions";
import { map, mergeMap } from "rxjs";

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

    create$ = createEffect(() => this.actions$.pipe(
        ofType(MovieListActions.create_movie),
        mergeMap(action => this.service.save(action.movie)
            .pipe(
                map(responseMovie => MovieListActions.movie_created({movie: responseMovie}))
            )
        )
    ));

}