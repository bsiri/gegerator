import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs";
import { ActivitylistService } from "src/app/services/activitylist.service";
import { ActivityActions } from "../actions/activity.actions";

@Injectable()
export class OtherActivityEffects{
    constructor(
        private actions$: Actions,
        private service: ActivitylistService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(ActivityActions.reload_activities),
        mergeMap(() => this.service.getAll()
            .pipe(
                map(activities => ActivityActions.activities_reloaded({activities}))
            )
        )
    ));

    create$ = createEffect(() => this.actions$.pipe(
        ofType(ActivityActions.create_activity),
        mergeMap(action => this.service.save(action.activity)
            .pipe(
                map(activity => ActivityActions.activity_created({activity}))
            )
        )
    ));

    update$ = createEffect(() => this.actions$.pipe(
        ofType(ActivityActions.update_activity),
        mergeMap(action => this.service.update(action.activity)
            .pipe(
                map(activity => ActivityActions.activity_updated({activity}))
            )        
        )
    ));

    delete$ = createEffect(() => this.actions$.pipe(
        ofType(ActivityActions.delete_activity),
        mergeMap(action => this.service.delete(action.activity)
            .pipe(
                map(activity => ActivityActions.activity_deleted({activity}))
            )
        )
    ));
}