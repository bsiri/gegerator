import { createReducer, on } from "@ngrx/store";
import { WizardConfiguration } from "src/app/models/wizardconfiguration.model";
import { ConfigurationActions } from "../actions/configuration.actions";

export const initialConfiguration = new WizardConfiguration()

export const configurationReducer = createReducer(
    initialConfiguration,
    on(ConfigurationActions.wizconf_reloaded,
        (state, {wizconf}) => wizconf
    ),
    on(ConfigurationActions.wizconf_updated,
        (state, {wizconf}) => wizconf
    )
)