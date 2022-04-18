import { createAction, props } from "@ngrx/store";
import { OtherActivity } from "src/app/models/activity.model";

export namespace ActivityActions{
    // Effect actions
    export const create_activity = createAction('[Activity] create', props<{activity: OtherActivity}>());
    export const reload_activities = createAction('[Activity] reload');
    export const update_activity = createAction('[Activity] update', props<{activity: OtherActivity}>());
    export const delete_activity = createAction('[Activity] delete', props<{activity: OtherActivity}>());

    // Reducer actions
    export const activity_created = createAction('[Activity] created', props<{activity: OtherActivity}>());
    export const activities_reloaded = createAction('[Activity] reloaded', props<{activities: OtherActivity[]}>());
    export const activity_updated = createAction('[Activity] updated', props<{activity: OtherActivity}>());
    export const activity_deleted = createAction('[Activity] deleted', props<{activity: OtherActivity}>());

}