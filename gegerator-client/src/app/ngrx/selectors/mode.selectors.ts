import { createFeatureSelector } from "@ngrx/store";
import { Mode } from "../appstate-models/mode.model";


export const selectMode = createFeatureSelector<Mode>('mode')
