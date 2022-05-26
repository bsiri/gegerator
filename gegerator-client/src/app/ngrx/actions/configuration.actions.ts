import { createAction, props } from "@ngrx/store";
import { WizardConfiguration } from "src/app/models/wizardconfiguration.model";


export namespace ConfigurationActions{
    // Actions consumed by effects
    export const reload_wizconf = createAction('[WizardConfiguration] reload')
    export const update_wizconf = createAction('[WizardConfiguration] update', props<{wizconf: WizardConfiguration}>())
    
    // Actions consumed by reducers
    export const wizconf_reloaded = createAction('[WizardConfiguration] reloaded', props<{wizconf: WizardConfiguration}>())
    export const wizconf_updated = createAction('[WizardConfiguration] updated', props<{wizconf: WizardConfiguration}>())
}