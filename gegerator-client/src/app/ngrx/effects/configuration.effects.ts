import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs";
import { ConfigurationService } from "src/app/services/configuration.service";
import { ConfigurationActions } from "../actions/configuration.actions";


@Injectable()
export class ConfigurationEffects{
    private actions$ = inject(Actions);
    private service = inject(ConfigurationService);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor(){}

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