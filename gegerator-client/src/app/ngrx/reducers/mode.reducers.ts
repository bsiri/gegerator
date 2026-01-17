import { createReducer, on } from "@ngrx/store";
import { ModeActions } from "../actions/mode.actions";
import { Mode } from "../appstate-models/mode.model";


export const modeReducer = createReducer(
    Mode.MANUAL,
    on(ModeActions.update_mode, (state, {newMode}) => {
        return newMode
    }),
    on(ModeActions.toggle_mode, (state) => {
        return (state == Mode.MANUAL) ? Mode.WIZARD : Mode.MANUAL
    })
)
