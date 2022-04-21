import { createFeatureSelector } from "@ngrx/store";
import { OtherActivity } from "../../models/activity.model";


export const selectActivitieslist = createFeatureSelector<ReadonlyArray<OtherActivity>>('activities');

