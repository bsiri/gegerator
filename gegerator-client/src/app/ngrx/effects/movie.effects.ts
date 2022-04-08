import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MovielistService } from "../../services/movielist.service";
import { MovieActions } from "../actions/movie.actions";
import { map, mergeMap } from "rxjs";

@Injectable()
export class MovieEffects {

    constructor(
        private actions$: Actions,
        private service: MovielistService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.reload_movies),
        mergeMap(() => this.service.getAll()
            .pipe(
                map(movies => MovieActions.movies_reloaded({movies}))
            )
        )
    ));   

    create$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.create_movie),
        mergeMap(action => this.service.save(action.movie)
            .pipe(
                map(response => MovieActions.movie_created({movie: response}))
            )
        )
    ));

    update$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.update_movie),
        mergeMap(action => this.service.update(action.movie)
            .pipe(
                map(response => MovieActions.movie_updated({movie: response}))
            )        
        )
    ));

}