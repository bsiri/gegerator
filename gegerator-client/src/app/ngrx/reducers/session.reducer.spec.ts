import { beforeEach, describe, it, expect } from 'vitest'
import { sessionReducer } from './session.reducer'
import { SessionActions } from '../actions/session.actions'
import { PlannedMovieSessionSpec, someSession } from 'src/_testhelpers/factories'
import { MovieSession } from 'src/app/models/session.model'
import { MovieRatings } from 'src/app/models/movie.model'

/**
 * Test suite skeleton for session reducer
 */

describe('sessionReducer', () => {
  beforeEach(() => {
    // Synchronous setup placeholder
  })

  it('should replace state when sessions_reloaded is dispatched', async () => {
    /*
      Goal: ensure `sessions_reloaded` replaces the state with the provided sessions array.

      Synopsis:
      - given: a non-empty `state` and `SessionActions.sessions_reloaded({ sessions })`
      - when: reducer(state, action) is called
      - then: returned state strictly equals the provided sessions

      Desired assertions:
      1. returned array equals the provided payload
      2. returned array is a new reference
    */
    const s1 = sampleSession({ id: 1 })
    const s2 = sampleSession({ id: 2 })
    const originalState = [s1]

    const newSessions = [s2]
    const action = SessionActions.sessions_reloaded({ sessions: newSessions })

    const res = sessionReducer(originalState, action)

    expect(res).toBe(newSessions)
    expect(res).not.toBe(originalState)
  })

  it('should append a session on session_created', async () => {
    /*
      Goal: verify `session_created` appends the session while preserving previous entries.

      Desired assertions:
      - original state not mutated
      - returned length incremented by 1
      - returned contains the created session
    */
    const s1 = sampleSession({ id: 10 })
    const s2 = sampleSession({ id: 11 })
    const originalState = [s1, s2]

    const created = sampleSession({ id: 300 })
    const action = SessionActions.session_created({ session: created })

    const res = sessionReducer(originalState, action)

    expect(originalState.length).toBe(2)
    expect(res.length).toBe(originalState.length + 1)
    expect(res[res.length - 1]).toBe(created)
  })

  it('should replace the existing session on session_updated', async () => {
    /*
      Goal: ensure `session_updated` replaces the session with matching id.

      Notes: test the happy path here, the error case is handled in a different test.
    */
    const s1 = sampleSession({ id: 101, rating: MovieRatings.DEFAULT })
    const s2 = sampleSession({ id: 102 })
    const originalState = [s1, s2]

    const updated = s1.copy({ rating: MovieRatings.HIGH })
    const action = SessionActions.session_updated({ session: updated })

    const res = sessionReducer(originalState, action)

    expect(res.length).toBe(originalState.length)
    const idx = res.findIndex(s => s.id === s1.id)
    expect(res[idx].id).toBe(s1.id)
    expect(originalState[0].id).toBe(s1.id)
  })

  it('should remove the session on session_deleted', async () => {
    /*
      Goal: verify `session_deleted` removes the session with matching id and keeps original state immutable.
    */
    const s1 = sampleSession({ id: 201 })
    const s2 = sampleSession({ id: 202 })
    const originalState = [s1, s2]

    const action = SessionActions.session_deleted({ session: s1 })

    const res = sessionReducer(originalState, action)

    expect(res.length).toBe(originalState.length - 1)
    expect(res.find(s => s.id === s1.id)).toBeUndefined()
    expect(originalState.length).toBe(2)
  })

  it('should throw when session_updated references unknown id', async () => {
    /*
      Goal: assert reducer throws when trying to update a non-existing session id.
    */
    const s1 = sampleSession({ id: 301 })
    const s2 = sampleSession({ id: 302 })
    const originalState = [s1, s2]

    const updated = sampleSession({ id: 9999 })
    const action = SessionActions.session_updated({ session: updated })

    expect(() => sessionReducer(originalState, action)).toThrowError(/Programmatic error.*/)
  })

})

function sampleSession(overrides?: PlannedMovieSessionSpec): MovieSession {
    return someSession(overrides).toMovieSession()
}