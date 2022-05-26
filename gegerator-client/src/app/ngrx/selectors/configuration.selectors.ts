import { createFeatureSelector } from "@ngrx/store";
import { WizardConfiguration } from "src/app/ngrx/appstate-models/wizardconfiguration.model";


export const selectConfiguration = createFeatureSelector<WizardConfiguration>('configuration')