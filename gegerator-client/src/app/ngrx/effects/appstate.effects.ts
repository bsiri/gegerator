import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, mergeMap, of } from "rxjs";
import { AppStateService } from "src/app/services/appstate.service";
import { ActivityActions } from "../actions/activity.actions";
import { AppStateActions } from "../actions/appstate.actions";
import { MovieActions } from "../actions/movie.actions";
import { SessionActions } from "../actions/session.actions";

@Injectable()
export class AppStateEffects{
    constructor(
        private store: Store,
        private actions$: Actions,
        private service: AppStateService
    ){}

    upload$ = createEffect(() => this.actions$.pipe(
        ofType(AppStateActions.upload_appstate),
        mergeMap(action => this.service.upload(action.file)
            .pipe(
                map(appstate => AppStateActions.appstate_reloaded({appstate}))
            )        
        )
    ));

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(AppStateActions.reload_appstate),
        mergeMap(action => this.service.reload()
        .pipe(
            map(appstate => AppStateActions.appstate_reloaded({appstate}))
        ))
    ))

    reloaded$ = createEffect(() => this.actions$.pipe(
        ofType(AppStateActions.appstate_reloaded),
        mergeMap(action => {
            const state = action.appstate
            this.store.dispatch(
                MovieActions.movies_reloaded({movies: state.movies})
            )
            this.store.dispatch(
                SessionActions.sessions_reloaded({sessions: state.sessions})
            )
            this.store.dispatch(
                ActivityActions.activities_reloaded({activities: state.activities})
            )
            return of(AppStateActions.dummy())
        })
    ))

}