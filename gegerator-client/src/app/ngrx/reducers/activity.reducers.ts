import { createReducer, on } from "@ngrx/store";
import { OtherActivity } from "src/app/models/activity.model";
import { ActivityActions } from "../actions/activity.actions";


export const initialActivityList: ReadonlyArray<OtherActivity> = []

export const activityReducer = createReducer(
    initialActivityList,
    on(ActivityActions.activities_reloaded, 
        (state, {activities}) => activities
    ),
    on(ActivityActions.activity_created, 
        (state, {activity}) => {
            const newState = state.slice();
            newState.push(activity);
            return newState;
        }   
    ),
    on(ActivityActions.activity_updated,
        (state, {activity}) => {
            const newState = state.slice();
            const activityIndex = newState.findIndex( s => s.id == activity.id)
            newState.splice(activityIndex, 1, activity);
            return newState;              
        }
    ),
    on(ActivityActions.activity_deleted,
        (state, {activity})  => state.filter(s => s.id != activity.id)
    )
)