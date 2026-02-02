import { createFeatureSelector } from "@ngrx/store";
import { OtherActivity } from "../../models/activity.model";


export const selectActivities = createFeatureSelector<readonly OtherActivity[]>('activities');

