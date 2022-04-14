import { createReducer, on } from "@ngrx/store";
import { RawSession } from "src/app/models/session.model";
import { SessionActions } from "../actions/session.actions";


export const initialRawSessionList: ReadonlyArray<RawSession> = []

export const rawSessionReducer = createReducer(
    initialRawSessionList,
    on(SessionActions.sessions_reloaded, 
        (state, {sessions}) => sessions
    ),
    on(SessionActions.session_created, 
        (state, {session}) => {
            const newState = state.slice();
            newState.push(session);
            return newState;
        }   
    ),
    on(SessionActions.session_updated,
        (state, {session}) => {
            const newState = state.slice();
            const sessionIndex = newState.findIndex( s => s.id == session.id)
            newState.splice(sessionIndex, 1, session);
            return newState;              
        }
    ),
    on(SessionActions.session_deleted,
        (state, {session})  => state.filter(s => s.id != session.id)
    )
)