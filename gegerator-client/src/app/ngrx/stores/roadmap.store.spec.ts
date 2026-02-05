import { describe, it, beforeEach, expect } from 'vitest'
import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Store } from '@ngrx/store'
import { selectPlannedMovieSessions } from 'src/app/ngrx/selectors/session.selectors'
import { selectActivities } from 'src/app/ngrx/selectors/activity.selectors'
import { someSession, someActivity } from 'src/_testhelpers/factories'
import { EventRatings } from 'src/app/models/plannable.model'
import { RoadmapData } from 'src/app/models/roadmap.model'
import { RoadmapStore } from './roadmap.store'
import { PlannedMovieSession } from 'src/app/models/session.model'
import { OtherActivity } from 'src/app/models/activity.model'
// note: avoid strict model imports for the test helper to keep types simple

describe('RoadmapStore (unit)', () => {
  beforeEach(() => {
    // ensure a fresh TestBed for each test
    TestBed.resetTestingModule()
  })

  it('provides $userRoadmap with only MANDATORY sessions and activities', async () => {
    /*
      Goal: verify `$userRoadmap` contains only sessions and activities whose
      `rating` is `EventRatings.MANDATORY`.

      Synopsis:
      - given: a mocked `Store` whose `selectSignal(selectPlannedMovieSessions)`
        returns a signal containing a mix of sessions (some mandatory, some default)
        and `selectSignal(selectActivities)` returns a mix of activities
      - when: the real `RoadmapStore` is injected and `$userRoadmap()` is read
      - then: the returned `FestivalRoadmap.sessions` only contains mandatory sessions
        and `FestivalRoadmap.activities` only contains mandatory activities

      Desired assertions:
      1. `roadmap.$userRoadmap().sessions` length equals number of mandatory sessions
      2. every returned session has `.rating == EventRatings.MANDATORY`
      3. equivalent assertions for activities

      Notes:
      - use `someSession({ rating: EventRatings.MANDATORY })` and
        `someActivity({ rating: EventRatings.MANDATORY })` to build fixtures
      - the test should mock `Store.selectSignal` to return `signal([...])`
    */
    // Arrange: create sessions and activities with mixed ratings
    const sMandatory = someSession({ id: 10, rating: EventRatings.MANDATORY })
    const sNormal = someSession({ id: 11, rating: EventRatings.DEFAULT })
    const aMandatory = someActivity({ id: 100, rating: EventRatings.MANDATORY })
    const aNormal = someActivity({ id: 101, rating: EventRatings.DEFAULT })

    const mockStore = mockStoreSelector([sMandatory, sNormal], [aMandatory, aNormal])

    TestBed.configureTestingModule({ providers: [{ provide: Store, useValue: mockStore }] })

    // Act: inject the real RoadmapStore
    const roadmap = TestBed.inject(RoadmapStore)
    const user = roadmap.$userRoadmap()

    // Assert: only mandatory items
    expect(user.sessions.length).toBe(1)
    expect(user.sessions.every(s => s.rating === EventRatings.MANDATORY)).toBe(true)
    expect(user.activities.length).toBe(1)
    expect(user.activities.every(a => a.rating === EventRatings.MANDATORY)).toBe(true)
  })

  it('updateWizardRoadmap(newData) makes $wizardRoadmap include only items with provided ids', async () => {
    /*
      Goal: ensure `updateWizardRoadmap` updates the internal roadmap data and
      `$wizardRoadmap` returns only sessions/activities whose ids are present
      in the provided `RoadmapData`.

      Synopsis:
      - given: mocked Store returning full lists of sessions and activities
      - when: calling `roadmap.updateWizardRoadmap({ sessionIds, activityIds })`
      - then: `roadmap.$wizardRoadmap().sessions` contains only sessions whose
        ids are in `sessionIds`, and activities likewise

      Desired assertions:
      1. `$wizardRoadmap().sessions` length equals provided `sessionIds` length
      2. each returned session.id is included in `sessionIds`
      3. same for activities

      Notes:
      - call the real method on the injected `RoadmapStore` instance
      - use factories to create sessions/activities with known ids
    */
    // Arrange: full lists
    const s1 = someSession({ id: 20 })
    const s2 = someSession({ id: 21 })
    const s3 = someSession({ id: 22 })
    const a1 = someActivity({ id: 200 })
    const a2 = someActivity({ id: 201 })

    const mockStore = mockStoreSelector([s1, s2, s3], [a1, a2])
    TestBed.configureTestingModule({ providers: [{ provide: Store, useValue: mockStore }] })

    const roadmap = TestBed.inject(RoadmapStore)

    // Act: update wizard roadmap to include only s1 and s3, and a2
    const rdata: RoadmapData = { sessionIds: [s1.id, s3.id], activityIds: [a2.id] }
    roadmap.updateWizardRoadmap(rdata)
    const wizard = roadmap.$wizardRoadmap()

    // Assert
    expect(wizard.sessions.length).toBe(2)
    expect(wizard.sessions.map(s => s.id).sort()).toEqual([s1.id, s3.id].sort())
    expect(wizard.activities.length).toBe(1)
    expect(wizard.activities[0].id).toBe(a2.id)
  })

  it('toggleMode switches $activeRoadmap between user and wizard roadmaps', async () => {
    /*
      Goal: verify `toggleMode()` flips the active roadmap between the user
      and wizard selections.

      Synopsis:
      - given: mocked store and an injected `RoadmapStore` instance
      - when: reading `$activeRoadmap()` then calling `toggleMode()` and reading again
      - then: `$activeRoadmap()` returns the other roadmap (wizard vs user)

      Desired assertions:
      1. initial `$activeRoadmap()` equals `$userRoadmap()` when initial mode is MANUAL
      2. after `toggleMode()`, `$activeRoadmap()` equals `$wizardRoadmap()`
      3. toggle again returns to user roadmap

      Notes:
      - ensure `updateWizardRoadmap()` is used to populate the wizard roadmap before toggling
    */
    // Arrange: prepare data
    const sm = someSession({ id: 30, rating: EventRatings.MANDATORY })
    const sNot = someSession({ id: 31, rating: EventRatings.DEFAULT })
    const a = someActivity({ id: 300, rating: EventRatings.MANDATORY })

    const mockStore = mockStoreSelector([sm, sNot], [a])
    TestBed.configureTestingModule({ providers: [{ provide: Store, useValue: mockStore }] })
    const roadmap = TestBed.inject(RoadmapStore)

    // ensure wizard roadmap differs: pick sNot as wizard
    roadmap.updateWizardRoadmap({ sessionIds: [sNot.id], activityIds: [] })

    // Act & Assert
    const userBefore = roadmap.$userRoadmap()
    const activeBefore = roadmap.$activeRoadmap()
    expect(activeBefore).toEqual(userBefore)

    roadmap.toggleMode()
    const activeAfterToggle = roadmap.$activeRoadmap()
    const wizard = roadmap.$wizardRoadmap()
    expect(activeAfterToggle).toEqual(wizard)

    roadmap.toggleMode()
    const activeAfterSecond = roadmap.$activeRoadmap()
    expect(activeAfterSecond).toEqual(roadmap.$userRoadmap())
  })

  it('handles empty sessions/activities gracefully (empty roadmaps)', async () => {
    /*
      Goal: ensure computed roadmaps are empty when the ngrx selectors return empty arrays.

      Synopsis:
      - given: mock Store returning empty arrays for sessions and activities
      - when: injecting RoadmapStore and reading `$userRoadmap()` and `$wizardRoadmap()`
      - then: both roadmaps have empty `sessions` and `activities` arrays

      Desired assertions:
      1. `$userRoadmap().sessions.length === 0` and same for activities
      2. `$wizardRoadmap().sessions.length === 0` and same for activities
    */
    // Arrange: empty lists
    const mockStore = mockStoreSelector([], [])
    TestBed.configureTestingModule({ providers: [{ provide: Store, useValue: mockStore }] })
    const roadmap = TestBed.inject(RoadmapStore)

    // Act
    const user = roadmap.$userRoadmap()
    const wizard = roadmap.$wizardRoadmap()

    // Assert
    expect(user.sessions.length).toBe(0)
    expect(user.activities.length).toBe(0)
    expect(wizard.sessions.length).toBe(0)
    expect(wizard.activities.length).toBe(0)
  })

})

// Helper used by tests to mock Store.selectSignal
function mockStoreSelector(sessionsArr: PlannedMovieSession[] = [], activitiesArr: OtherActivity[] = []) : any {
  return {
    selectSignal: (selector: any) => {
      if (selector === selectPlannedMovieSessions) return signal(sessionsArr)
      if (selector === selectActivities) return signal(activitiesArr)
      return signal([])
    }
  } as any
}
