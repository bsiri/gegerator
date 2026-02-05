import { beforeEach, describe, it, expect } from 'vitest'
import { activityReducer } from './activity.reducers'
import { ActivityActions } from '../actions/activity.actions'
import { someActivity } from 'src/_testhelpers/factories'

/**
 * Test suite skeleton for activity reducer
 *
 * Each test is intentionally left empty and contains a block comment
 * describing the goal, the given/when/then scenario and the desired
 * assertions to implement.
 */

describe('activityReducer', () => {
  beforeEach(() => {
    // Synchronous setup placeholder
    // - prepare sample OtherActivity instances using factories or constructors
    // - build initial arrays to feed to the reducer
  })

  it('should replace state when activities_reloaded is dispatched', async () => {
    /*
      Goal: ensure `activities_reloaded` action replaces the current list
      with the provided activities array.

      Synopsis:
      - given: a non-empty `state` and an action `ActivityActions.activities_reloaded({ activities })`
      - when: reducer(state, action) is called
      - then: returned state strictly equals the `activities` payload

      Desired assertions:
      1. returned array equals the provided `activities` (object equality)
      2. the returned array is not the same reference as the previous state (immutability)
    */
    const a1 = someActivity({ id: 10 })
    const a2 = someActivity({ id: 11 })
    const originalState = [a1]

    const newActivities = [a2]
    const action = ActivityActions.activities_reloaded({ activities: newActivities })

    const res = activityReducer(originalState, action)

    // returned state should be the provided payload
    expect(res).toBe(newActivities)
    // previous state must not be the same reference
    expect(res).not.toBe(originalState)
  })

  it('should append an activity on activity_created', async () => {
    /*
      Goal: verify `activity_created` adds the new activity to the returned
      state while preserving previous entries.

      Synopsis:
      - given: `state` with N activities and `action = ActivityActions.activity_created({ activity })`
      - when: reducer(state, action) is called
      - then: returned array length is N+1 and the last element equals the new activity

      Desired assertions:
      1. `state` is not mutated (original array kept intact)
      2. returned array length is previous length + 1
      3. returned array contains the newly created activity (by id or deep equality)
    */
    const a1 = someActivity({ id: 20 })
    const a2 = someActivity({ id: 21 })
    const originalState = [a1, a2]

    const created = someActivity({ id: 300 })
    const action = ActivityActions.activity_created({ activity: created })

    const res = activityReducer(originalState, action)

    // original state not mutated
    expect(originalState.length).toBe(2)
    // returned has one more item and contains the created activity as last element
    expect(res.length).toBe(originalState.length + 1)
    expect(res[res.length - 1]).toBe(created)
  })

  it('should replace the existing activity on activity_updated', async () => {
    /*
      Goal: ensure `activity_updated` replaces the item matching the id
      with the provided activity instance.

      Synopsis:
      - given: `state` contains an activity with id X and `action = ActivityActions.activity_updated({ activity })` where `activity.id === X`
      - when: reducer(state, action) is called
      - then: returned state contains the updated activity in the same position

      Desired assertions:
      1. `state` is not mutated
      2. returned array length equals initial length
      3. the element with id X in returned array equals the updated activity
      4. other elements remain unchanged
    */
    const a1 = someActivity({ id: 1001, description: 'orig' })
    const a2 = someActivity({ id: 1002 })
    const originalState = [a1, a2]

    const updated = a1.copy({ description: 'updated' })

    const action = ActivityActions.activity_updated({ activity: updated })

    const res = activityReducer(originalState, action)

    expect(res.length).toBe(originalState.length)
    const idx = res.findIndex(s => s.id === a1.id)
    expect(res[idx].description).toBe('updated')
    // ensure original state not mutated
    expect(originalState[0].description).toBe('orig')
  })

  it('should remove the activity on activity_deleted', async () => {
    /*
      Goal: verify `activity_deleted` removes the activity with matching id.

      Synopsis:
      - given: `state` contains an activity with id X and `action = ActivityActions.activity_deleted({ activity })` where `activity.id === X`
      - when: reducer(state, action) is called
      - then: returned state does not contain any activity with id X and length is decremented by 1

      Desired assertions:
      1. returned array length is previous length - 1
      2. no element in returned array has id X
      3. original `state` is not mutated
    */
    const a1 = someActivity({ id: 40 })
    const a2 = someActivity({ id: 41 })
    const originalState = [a1, a2]

    const action = ActivityActions.activity_deleted({ activity: a1 })

    const res = activityReducer(originalState, action)

    // returned length is decremented
    expect(res.length).toBe(originalState.length - 1)
    // no element with deleted id
    expect(res.find(s => s.id === a1.id)).toBeUndefined()
    // original state unchanged
    expect(originalState.length).toBe(2)
  })

  it('should not accidentally modify another item when updating a non-existing id', async () => {
    /*
      Goal: document behavior (and guard against regressions) when
      `activity_updated` is dispatched for an id that does not exist in state.

      Synopsis:
      - given: `state` without an activity having id Y and `action = ActivityActions.activity_updated({ activity })` with `activity.id === Y`
      - when: reducer(state, action) is called
      - then: an error is thrown indicating the id does not exist 

      Desired assertions:
      1. returned array equals the original state (deep equality)
      2. no other element was replaced unexpectedly

      Notes: current implementation uses `splice` with index -1 when not found — this can mutate the last element; ensure tests capture that bug if present.
    */
    const a1 = someActivity({ id: 2001 })
    const a2 = someActivity({ id: 2002 })
    const originalState = [a1, a2]

    const updated = someActivity({ id: 9999, description: 'ghost' })
    const action = ActivityActions.activity_updated({ activity: updated })

    expect(() => activityReducer(originalState, action)).toThrowError(/Programmatic error.*/)
  })

})
