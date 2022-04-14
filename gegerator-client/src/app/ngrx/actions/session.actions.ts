import { createAction, props } from "@ngrx/store";
import { MovieSession } from "src/app/models/session.model";

export namespace SessionActions{
    // Effect actions
    export const create_session = createAction('[Session] create', props<{session: MovieSession}>());
    export const reload_sessions = createAction('[Session] reload');
    export const update_session = createAction('[Session] update', props<{session: MovieSession}>());
    export const delete_session = createAction('[Session] delete', props<{session: MovieSession}>());

    // Reducer actions
    export const session_created = createAction('[Session] created', props<{session: MovieSession}>());
    export const sessions_reloaded = createAction('[Session] reloaded', props<{sessions: MovieSession[]}>());
    export const session_updated = createAction('[Session] updated', props<{session: MovieSession}>());
    export const session_deleted = createAction('[Session] deleted', props<{session: MovieSession}>());

}