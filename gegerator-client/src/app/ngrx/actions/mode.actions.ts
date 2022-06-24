import { createAction, props } from "@ngrx/store";
import { Mode } from "../appstate-models/mode.model";


export namespace ModeActions{
    export const update_mode = createAction('[Mode] update', props<{newMode: Mode}>());
}
