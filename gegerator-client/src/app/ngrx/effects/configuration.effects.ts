import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs";
import { ConfigurationService } from "src/app/services/configuration.service";
import { ConfigurationActions } from "../actions/configuration.actions";


@Injectable()
export class ConfigurationEffects{
    constructor(
        private actions$: Actions, 
        private service: ConfigurationService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(ConfigurationActions.reload_wizconf),
        mergeMap(() => this.service.getWizardConfiguration()
        .pipe(
            map(wizconf => ConfigurationActions.wizconf_reloaded({wizconf}))
        ))
    ))

    update$ = createEffect(() => this.actions$.pipe(
        ofType(ConfigurationActions.update_wizconf),
        mergeMap(action => this.service.updateWizardConfiguration(action.wizconf)
        .pipe(
            map(wizconf => ConfigurationActions.wizconf_updated({wizconf}))
        ))
    ))
}