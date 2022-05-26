import { createAction, props } from "@ngrx/store";
import { AppState } from '../appstate-models/app.state'

export namespace AppStateActions{
    // Effect actions
    export const upload_appstate = createAction('[AppState] upload', props<{file: File}>())
    export const reload_appstate = createAction('[AppState] reload')
    export const appstate_reloaded = createAction('[AppState] reloaded', props<{appstate: AppState}>())

    // Dummy actions
    // I need it because Effects need to return an Action, even though it makes no sense sometimes.
    export const dummy = createAction('[AppState] <dummy>')

    // Reducers actions : none
    // indeed an AppState is not really a member of the store model
}