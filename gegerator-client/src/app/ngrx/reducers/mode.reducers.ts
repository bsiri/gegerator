import { createReducer, on } from "@ngrx/store";
import { ModeActions } from "../actions/mode.actions";
import { Mode } from "../appstate-models/mode.model";


export const initialMode = Mode.MANUAL

export const modeReducer = createReducer(
    initialMode,
    on(ModeActions.update_mode, (state, {newMode}) => {
        return newMode
    })
)
