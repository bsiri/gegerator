import { createAction, props } from "@ngrx/store";


export namespace WizardRoadmapActions{
    export const wizardroadmap_reloaded = createAction('[WizardRoadmap] reloaded', 
                props<{sessionIds: Array<number>, activityIds: Array<number>}>())
}
