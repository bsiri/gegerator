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

    /*
        Note: as indicated by the code, the 'thenReload' paramater 
        indicates that instead of normally raising the usual 'session_updated' 
        event we trigger a full reload of the sessions.

        This is the case when the updated attributes are likely to trigger 
        business rules on the server side, which may alter more session than 
        just this one.

        The simplest solution is to just reload the whole thing afterward, 
        but if this solution causes performance issues then we should consider
        replicating the business rules here on client side. 
    */
    update$ = createEffect(() => this.actions$.pipe(
        ofType(SessionActions.update_session),
        mergeMap(action => this.service.update(action.session)
            .pipe(
                map(session => {
                    if (action.thenReload === true){
                        return SessionActions.reload_sessions()
                    }
                    else{
                        return SessionActions.session_updated({session})
                    }
                })
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