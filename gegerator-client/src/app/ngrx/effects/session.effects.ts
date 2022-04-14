import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs";
import { SessionlistService } from "src/app/services/sessionlist.service";
import { SessionActions } from "../actions/session.actions";


@Injectable()
export class MovieSessionEffects{
    constructor(
        private actions$: Actions,
        private service: SessionlistService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(SessionActions.reload_sessions),
        mergeMap(() => this.service.getAll()
            .pipe(
                map(sessions => SessionActions.sessions_reloaded({sessions}))
            )
        )
    ));

    create$ = createEffect(() => this.actions$.pipe(
        ofType(SessionActions.create_session),
        mergeMap(action => this.service.save(action.session)
            .pipe(
                map(session => SessionActions.session_created({session}))
            )
        )
    ));

    update$ = createEffect(() => this.actions$.pipe(
        ofType(SessionActions.update_session),
        mergeMap(action => this.service.update(action.session)
            .pipe(
                map(session => SessionActions.session_updated({session}))
            )        
        )
    ));

    delete$ = createEffect(() => this.actions$.pipe(
        ofType(SessionActions.delete_session),
        mergeMap(action => this.service.delete(action.session)
            .pipe(
                map(session => SessionActions.session_deleted({session}))
            )
        )
    ));
    

}