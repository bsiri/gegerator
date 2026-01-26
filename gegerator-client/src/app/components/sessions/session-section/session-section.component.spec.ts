import { describe, it, beforeEach, expect, vi } from 'vitest'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { RoadmapStore } from 'src/app/ngrx/stores/roadmap.store'
import { SessionSectionComponent } from './session-section.component'
import { PlannedMovieSession } from 'src/app/models/session.model'
import { OtherActivity } from 'src/app/models/activity.model'
import { Theaters, Days, Day } from 'src/app/models/referential.data'
import { Time } from 'src/app/models/time.model'
import { defaultSession, defaultActivity } from 'src/_testhelpers/factories'
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model'

/*
  Test skeleton for SessionSectionComponent.
  - Two suites: Unit tests and UI tests
  - Tests are declared but not implemented; each test contains a descriptive block
    explaining the goal, setup, actions and desired assertions.

  Note: actual TestBed / harness setup should be implemented when converting
  these skeletons into runnable tests.
*/

describe('SessionSectionComponent — Unit', () => {
  // Shared fixtures
  let fixture: ComponentFixture<SessionSectionComponent>
  let component: SessionSectionComponent
  let loader: HarnessLoader
  let helper: ReturnType<typeof harnessHelper>
  let mockMatDialog: any
  let mockStore: any

  beforeEach(async () => {
    // Default dialogRef implementation throws to force tests to stub it
    const defaultDialogRef = { afterClosed: () => { throw new Error('DialogRef.afterClosed not stubbed in test') } }
    mockMatDialog = { open: vi.fn(() => defaultDialogRef) }

    mockStore = { dispatch: vi.fn(), select: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [SessionSectionComponent],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: Store, useValue: mockStore },
        { provide: RoadmapStore, useValue: { $activeRoadmap: () => emptyRoadmap() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(SessionSectionComponent)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
    helper = harnessHelper(loader)

    // reset spies for per-test overrides
    mockMatDialog.open.mockReset()
    mockMatDialog.open.mockReturnValue(defaultDialogRef)
    mockStore.dispatch = vi.fn()
  })

  it('computes rowHeightInPixel from SESSION_DAY_BOUNDARIES', async () => {
    /*
      Goal: verify `rowHeightInPixel` is computed using SESSION_DAY_BOUNDARIES.sessionDayInPixel()

      Synopsis:
      - given: a default component instance
      - when: the component is created
      - then: `rowHeightInPixel` equals `${SESSION_DAY_BOUNDARIES.sessionDayInPixel()}px`

      Desired assertions:
      1. `rowHeightInPixel` ends with 'px'
      2. the numeric part is strictly equal to SESSION_DAY_BOUNDARIES.sessionDayInPixel()
    */
  })

  it('consumes $sessions and $activities signals and returns values', async () => {
    /*
      Goal: ensure the component reads its signals for sessions and activities

      Synopsis:
      - given: mocked signals exposing lists of sessions and activities
      - when: reading the internal signal values
      - then: the component returns exactly those arrays

      Desired assertions:
      1. `$sessions()` returns the provided sessions array
      2. `$activities()` returns the provided activities array
    */
  })

  it('sessionsByDayAndTheater filters sessions by day and theater', async () => {
    /*
      Goal: test `sessionsByDayAndTheater(day, theater)` filtering logic

      Synopsis:
      - given: a sessions array containing items across multiple days/theaters
      - when: calling the method for a specific day and theater
      - then: only matching sessions are returned

      Desired assertions:
      1. returned array length equals expected count
      2. every returned session has the requested `day` and `theater`
    */
  })

  it('activitiesByDay filters activities by day', async () => {
    /*
      Goal: test `activitiesByDay(day)` filtering logic

      Synopsis:
      - given: an activities array spanning multiple days
      - when: calling `activitiesByDay` for a given day
      - then: only activities of that day are returned

      Desired assertions:
      1. returned array contains only items with `day` equal to the requested day
    */
  })

  it('openNewSession opens SessionDialog and dispatches create_session then re-opens; second time it closes nothing has to be dispatched', async () => {
    /*
      Goal: verify openNewSession flow: dialog open, dispatch and re-open on success; on the second time it closes without dispatch

      Synopsis:
      - given: a MatDialog mock and a Store mock
      - and: the dialog.afterClosed yields a valid session payload the first time, undefined the second time
      - when: calling `openNewSession(day, theater)`
      - then: Store.dispatch is called with SessionActions.create_session and
        the method triggers another open (chain behavior)
      - then: on the second call, no dispatch occurs

      Desired assertions:
      1. `MatDialog.open` called with `SessionDialog` and correct `data` (day, theater)
      2. `Store.dispatch` called with `create_session` and a MovieSession built from dialog result
      3. `MatDialog.open` called a second time to reopen the dialog
      4. on the second call, `MatDialog.open` is called again with correct data
      5. on the second call, `Store.dispatch` is NOT called
    */
  })

  it('openNewActivity opens Activitydialog and dispatches create_activity then re-opens; second time it closes nothing has to be dispatched', async () => {
    /*
      Goal: verify openNewActivity flow: dialog open, dispatch and re-open on success; on the second time it closes without dispatch

      Synopsis:
      - given: a MatDialog mock and a Store mock
      - and: the dialog.afterClosed yields a valid activity payload
      - when: calling `openNewActivity(day)`
      - then: Store.dispatch is called with ActivityActions.create_activity and
        the method triggers another open (chain behavior)
      - then: on the second call, no dispatch occurs

      Desired assertions:
      1. `MatDialog.open` called with `Activitydialog` and correct `data` (day)
      2. `Store.dispatch` called with `create_activity` and an OtherActivity built from dialog result
      3. `MatDialog.open` called a second time to reopen the dialog
      4. on the second call, `MatDialog.open` is called again with correct data
      5. on the second call, `Store.dispatch` is NOT called
    */
  })
})

describe('SessionSectionComponent — UI', () => {
  // Shared fixtures
  let fixture: ComponentFixture<SessionSectionComponent>
  let component: SessionSectionComponent
  let loader: HarnessLoader
  let helper: ReturnType<typeof harnessHelper>
  let mockMatDialog: any
  let mockStore: any

  beforeEach(async () => {
    // Default dialogRef implementation throws to force tests to stub it
    const defaultDialogRef = { afterClosed: () => { throw new Error('DialogRef.afterClosed not stubbed in test') } }
    mockMatDialog = { open: vi.fn(() => defaultDialogRef) }

    mockStore = { dispatch: vi.fn(), select: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [SessionSectionComponent],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: Store, useValue: mockStore },
        { provide: RoadmapStore, useValue: { $activeRoadmap: () => emptyRoadmap() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(SessionSectionComponent)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
    helper = harnessHelper(loader)

    // reset spies for per-test overrides
    mockMatDialog.open.mockReset()
    mockMatDialog.open.mockReturnValue(defaultDialogRef)
    mockStore.dispatch = vi.fn()
  })

  it('renders one section per Days and correct counts of sessions and activities', async () => {
    /*
      Goal: verify the template renders a row per day and the correct number of
            child components for sessions and activities.

      Synopsis:
      - given: signals returning a list of sessions and activities covering several Days and Theaters
      - when: component is rendered in the DOM
      - then: for each day there is a `.session-day` container
            and the correct number of `<app-planned-movie-session>` and `<app-other-activity>` elements

      UI actions (explicit):
      - Render the component with a test harness
      - Query DOM for `.session-day` elements and the child component tags

      Desired assertions:
      1. number of `.session-day` equals Days.enumerate().length
      2. for each provided PlannedMovieSession, a corresponding `app-planned-movie-session` node exists in the correct column for its theater
      3. for each provided OtherActivity, a corresponding `app-other-activity` node exists in the activity column for its day
    */
  })

  it('clicking header add buttons triggers openNewSession and openNewActivity', async () => {
    /*
      Goal: ensure header buttons are wired to component handlers.

      Synopsis:
      - given: the component rendered in the DOM
      - when: user clicks the 'add' button in a session header and the activity header
      - then: the component's `openNewSession` / `openNewActivity` are invoked

      UI actions (explicit):
      - find the buttons via harnessHelper + testid and perform `click()`

      Desired assertions:
      1. the component method spies are called with expected parameters (day, theater)
    */
  })

  it('passes roadmap signal value to child components as `roadmap` input', async () => {
    /*
      Goal: verify that child components receive the `roadmap` via input binding

      Synopsis:
      - given: RoadmapStore.$activeRoadmap exposes a specific roadmap object
      - when: component is rendered
      - then: each rendered `app-planned-movie-session` and `app-other-activity` has been given that roadmap

      UI actions (explicit):
      - Render the component and inspect child component instances (or their host elements/properties)

      Desired assertions:
      1. the DOM or harness reveals the `roadmap` value propagated to children
    */
  })

  const sessionPlacementDataset:  Day[] = [
    Days.FRIDAY,
    Days.SATURDAY,
    Days.SUNDAY
  ]
  it.for<Day>(sessionPlacementDataset)('comprehensive placement: sessions and activities are rendered in correct day/column', async (day: Day) => {
    /*
      Goal: given a comprehensive dataset of PlannedMovieSession and OtherActivity items,
            ensure each event is rendered in the correct `.session-day` row and the correct theater column.

      Synopsis:
      - given: a dataset containing multiple sessions across Days {FRIDAY, SATURDAY, SUNDAY} and Theaters {ESPACE_LAC, CASINO, PARADISO, MCL}
      - and: activities across several days
      - when: component is rendered
      - then: for every event its corresponding element is located inside the `.session-day` for its `day` and inside the proper column for its `theater` (sessions) or activity column (activities)

      UI actions (explicit):
      - mount component with test harness and mocked signals providing the dataset
      - query DOM per-day and per-column and assert presence/absence

      Desired assertions:
      1. the total number of `app-planned-movie-session` for each day table and in each theater column matches the dataset
      2. each `app-other-activity` appears in the activity cell of its day
      3. no session appears in the wrong theater column
    */
  })
})

// Test data factories and helper values can be appended here when implementing the tests.

// -----------------------------------------------------------------------------
// Concrete test dataset: a dozen sessions and several other activities
// These deterministic fixtures are used by UI tests to validate rendering,
// placement and ordering by day/theater.
// -----------------------------------------------------------------------------

export const TEST_PLANNED_SESSIONS: PlannedMovieSession[] = [
  defaultSession({ id: 101, theater: Theaters.ESPACE_LAC, day: Days.FRIDAY, startTime: new Time(10, 0) }),
  defaultSession({ id: 102, theater: Theaters.CASINO, day: Days.FRIDAY, startTime: new Time(12, 30) }),
  defaultSession({ id: 103, theater: Theaters.PARADISO, day: Days.FRIDAY, startTime: new Time(15, 0) }),
  defaultSession({ id: 104, theater: Theaters.MCL, day: Days.SATURDAY, startTime: new Time(9, 30) }),
  defaultSession({ id: 105, theater: Theaters.ESPACE_LAC, day: Days.SATURDAY, startTime: new Time(11, 45) }),
  defaultSession({ id: 106, theater: Theaters.CASINO, day: Days.SATURDAY, startTime: new Time(14, 0) }),
  defaultSession({ id: 107, theater: Theaters.PARADISO, day: Days.SUNDAY, startTime: new Time(10, 15) }),
  defaultSession({ id: 108, theater: Theaters.MCL, day: Days.SUNDAY, startTime: new Time(13, 30) }),
  defaultSession({ id: 109, theater: Theaters.ESPACE_LAC, day: Days.WEDNESDAY, startTime: new Time(16, 0) }),
  defaultSession({ id: 110, theater: Theaters.CASINO, day: Days.WEDNESDAY, startTime: new Time(18, 30) }),
  defaultSession({ id: 111, theater: Theaters.PARADISO, day: Days.THURSDAY, startTime: new Time(20, 0) }),
  defaultSession({ id: 112, theater: Theaters.MCL, day: Days.THURSDAY, startTime: new Time(21, 30) }),
]

export const TEST_OTHER_ACTIVITIES: OtherActivity[] = [
  defaultActivity({ id: 201, day: Days.FRIDAY, startTime: new Time(9, 0), endTime: new Time(9, 45), description: 'Setup' }),
  defaultActivity({ id: 202, day: Days.FRIDAY, startTime: new Time(17, 0), endTime: new Time(18, 0), description: 'Q&A' }),
  defaultActivity({ id: 203, day: Days.SATURDAY, startTime: new Time(12, 0), endTime: new Time(13, 0), description: 'Lunch Talk' }),
  defaultActivity({ id: 204, day: Days.SUNDAY, startTime: new Time(8, 30), endTime: new Time(9, 30), description: 'Breakfast Meetup' }),
  defaultActivity({ id: 205, day: Days.WEDNESDAY, startTime: new Time(15, 0), endTime: new Time(16, 30), description: 'Panel' }),
  defaultActivity({ id: 206, day: Days.THURSDAY, startTime: new Time(19, 0), endTime: new Time(20, 0), description: 'Afterparty' }),
]

function emptyRoadmap(): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
}