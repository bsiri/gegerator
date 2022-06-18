import { createReducer, on } from "@ngrx/store";
import { RoadmapData } from "src/app/models/roadmap.model";
import { WizardRoadmapActions } from "../actions/wizard-roadmap.actions";

export const initialWizardRoadmap: RoadmapData = {
    sessionIds : [],
    activityIds : []
}

export const wizardroadmapReducer = createReducer(
    initialWizardRoadmap,
    on(WizardRoadmapActions.wizardroadmap_reloaded, (state, roadmpadata) => roadmpadata)
)
