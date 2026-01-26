import { describe, it, beforeEach, expect, vi } from 'vitest'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DebugElement, NO_ERRORS_SCHEMA, signal } from '@angular/core'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { RoadmapStore } from 'src/app/ngrx/stores/roadmap.store'
import { SessionSectionComponent } from './session-section.component'
import { PlannedMovieSession, MovieSession } from 'src/app/models/session.model'
import { OtherActivity } from 'src/app/models/activity.model'
import { Theaters, Days, Day, Theater } from 'src/app/models/referential.data'
import { Time } from 'src/app/models/time.model'
import { defaultSession, defaultActivity, sessionBuilder, someSession } from 'src/_testhelpers/factories'
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model'
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model'
import { of } from 'rxjs'
import { selectPlannedMovieSessions } from 'src/app/ngrx/selectors/session.selectors'
import { selectActivities } from 'src/app/ngrx/selectors/activity.selectors'
import { PlannableEvent } from 'src/app/models/plannable.model'
import { By } from '@angular/platform-browser'
import { PlannedMovieSessionComponent } from '../planned-movie-session/planned-movie-session.component'
import { OtherActivityComponent } from '../other-activity/other-activity.component'
import { mock } from 'node:test'

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

        // provide selectSignal so component field initializers can call it
        mockStore = { dispatch: vi.fn(), selectSignal: mockStoreSelector([],[])}

        await TestBed.configureTestingModule({
            imports: [SessionSectionComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: Store, useValue: mockStore },
                { provide: RoadmapStore, useValue: { $activeRoadmap: () => emptyRoadmap() } }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents()

        // do NOT create the component here: tests will create it after configuring selectSignal and other per-test mocks
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
        // Arrange: component with default empty signals
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Act/Assert
        expect(component.rowHeightInPixel).toBe(SESSION_DAY_BOUNDARIES.sessionDayInPixel() + 'px')
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
        // Arrange: prepare expected arrays and make store.selectSignal return them
        const sessionsArr = [defaultSession({ id: 900 }), defaultSession({ id: 901 })]
        const activitiesArr = [defaultActivity({ id: 700 }), defaultActivity({ id: 701 })]
        mockStore.selectSignal = mockStoreSelector(sessionsArr, activitiesArr)

        // Act: create component now that selectSignal is configured
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Assert: signals expose the arrays (verify array shape and contents)
        expect(component.$sessions()).toEqual(sessionsArr)
        expect(component.$activities()).toEqual(activitiesArr)
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
        // Arrange: sessions across days/theaters
        const fridayCasino = defaultSession({ day: Days.FRIDAY, theater: Theaters.CASINO })
        const fridayEspaceLac = defaultSession({ day: Days.FRIDAY, theater: Theaters.ESPACE_LAC })
        const saturdayCasino = defaultSession({ day: Days.SATURDAY, theater: Theaters.CASINO })
        mockStore.selectSignal = mockStoreSelector([saturdayCasino, fridayCasino, fridayEspaceLac])

        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Act
        const res = component.sessionsByDayAndTheater(Days.FRIDAY, Theaters.CASINO)

        // Assert
        expect(res.length).toBe(1)
        expect(res[0]).toBe(fridayCasino)
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
        // Arrange
        const sunday = defaultActivity({ day: Days.SUNDAY })
        const friday = defaultActivity({ day: Days.FRIDAY })
        mockStore.selectSignal = mockStoreSelector([], [sunday, friday])

        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Act
        const res = component.activitiesByDay(Days.SUNDAY)

        // Assert
        expect(res.length).toBe(1)
        expect(res[0]).toBe(sunday)
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
        // Arrange: stub dialog to return a created session first, then undefined
        const newsession = { id: 15, movie: { id: 55 }, theater: Theaters.CASINO, day: Days.FRIDAY, startTime: new Time(11, 0) }
        mockMatDialog.open = vi.fn()
            .mockReturnValueOnce({ afterClosed: () => of(newsession) })
            .mockReturnValueOnce({ afterClosed: () => of(undefined) })

        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Act
        component.openNewSession(newsession.day, newsession.theater)

        // Assert: dialog opened twice (one returned data, one not) and store.dispatch called once with create_session
        expect(mockMatDialog.open).toHaveBeenCalledTimes(2)
        expect(mockStore.dispatch).toHaveBeenCalledTimes(1)
        const dispatched = mockStore.dispatch.mock.calls[0][0]
        expect(dispatched.session).toBeInstanceOf(MovieSession)
        expect(dispatched.session.movieId).toBe(newsession.movie.id)
        expect(dispatched.session.theater).toBe(newsession.theater)

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
        // Arrange: stub dialog to return a created activity first, then undefined
        const newactivity = { id: 777, day: Days.SATURDAY, startTime: new Time(12, 0), endTime: new Time(13, 0), description: 'Meet' }
        mockMatDialog.open = vi.fn()
                .mockReturnValueOnce({ afterClosed: () => of(newactivity) })
                .mockReturnValueOnce({ afterClosed: () => of(undefined) })

        mockStore.selectSignal = vi.fn(() => () => [])
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance

        // Act
        component.openNewActivity(newactivity.day)

        // Assert
        expect(mockMatDialog.open).toHaveBeenCalledTimes(2)
        expect(mockStore.dispatch).toHaveBeenCalled()
        const dispatched = mockStore.dispatch.mock.calls[0][0]
        expect(dispatched.activity.id).toBe(newactivity.id)
        expect(dispatched.activity.day).toBe(newactivity.day)
        expect(dispatched.activity.startTime).toBe(newactivity.startTime)
    })
})

describe('SessionSectionComponent — UI', () => {
    // Shared fixtures
    let fixture: ComponentFixture<SessionSectionComponent>
    let component: SessionSectionComponent
    let loader: HarnessLoader
    let mockMatDialog: any
    let mockStore: any

    beforeEach(async () => {
        // Default dialogRef implementation throws to force tests to stub it
        const defaultDialogRef = { afterClosed: () => { throw new Error('DialogRef.afterClosed not stubbed in test') } }
        mockMatDialog = { open: vi.fn(() => defaultDialogRef) }

        mockStore = { dispatch: vi.fn(), selectSignal: mockStoreSelector([],[]) }

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

        // reset spies for per-test overrides
        mockMatDialog.open.mockReset()
        mockMatDialog.open.mockReturnValue(defaultDialogRef)
        mockStore.dispatch = vi.fn()
    })

    it('renders one section per Days and all the headers', async () => {
        /*
          Goal: verify the template renders one section per day 
    
          Synopsis:
          - given: signals returning a list of sessions and activities covering several Days and Theaters
          - when: component is rendered in the DOM
          - then: for each day there is a `.session-day` container
          - then: each day and section has all expected header columns (one per theater + one for activities)

          Desired assertions:
          1. number of `.session-day` equals Days.enumerate().length
          2. each day and each theaters + other activity has a header column with add button
    
        */
        // Arrange: make the store signals return the test datasets (Empty here is sufficient)
        mockStore.selectSignal = mockStoreSelector( [], [])

        // Act: create component
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        await fixture.whenStable()

        ////////////////// Assert: one .session-day per day
        const dayContainers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.session-day')
        expect(dayContainers.length).toBe(Days.enumerate().length)

        ////////////////// Assert the headers section
        // helper function
        const getHeaderColumn = (day: Day, suffix: string) => fixture.debugElement.query(By.css(`.testid-sc-header-${day.key}-${suffix}`))
        const findButton = (elt: DebugElement) => elt.query(By.css('button'))
        // const findButton = (elt: DebugElement) => elt.nativeElement.querySelector('button')
        // main loop
        for (const day of Days.enumerate()){
            // activity header
            const actHeaderCol = getHeaderColumn(day, 'act')
            expect(findButton(actHeaderCol)).toBeTruthy()

            // theater headers
            for (const theater of Theaters.enumerate()){
                const thHeaderCol = getHeaderColumn(day, theater.key)
                expect(findButton(thHeaderCol)).toBeTruthy()
            }
        }
    })

    it('renders the sessions in the correct swimlanes', async () => {
        /*
          Goal: verify the template renders the sessions in their expected days and theaters
    
          Synopsis:
          - given: signals returning a list of sessions and activities covering several Days and Theaters
          - when: component is rendered in the DOM
          - then: the sessions appear in the expected swimlanes

          Desired assertions:
          1. for each provided PlannedMovieSession, a corresponding `app-planned-movie-session` node exists in the correct column for its theater and day
        */
        // Arrange: make the store signals return the test datasets (sessions only, no activities)
        mockStore.selectSignal = mockStoreSelector(
            TEST_PLANNED_SESSIONS, 
            []
        )

        // Act: create component
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        await fixture.whenStable()
    
        ///////////////// Assert that sessions are correctly placed by day and theater
        // helper functions
        const getSessionColumn = (day: Day, theater: Theater) => fixture.debugElement.query(By.css(`.testid-sc-sw-${day.key}-${theater.key}`))
        // main loop
        for (const day of Days.enumerate()) {
            for (const theater of Theaters.enumerate()){
                const col = getSessionColumn(day, theater)
                
                // collect the sessions in all components in that column
                const sortedActual = col.queryAll(By.directive(PlannedMovieSessionComponent))
                                            .map(c => c.componentInstance as PlannedMovieSessionComponent)
                                            .map(pms => pms.session)
                                            .sort(sortPlannable)

                // collect the sessions as returned by the component
                const sortedExpected = component.sessionsByDayAndTheater(day, theater).sort(sortPlannable)

                // both collection should be exactly equal
                expect(sortedExpected).toEqual(sortedActual)
                
            }
        }
    })

    it('renders the activities in the correct swimlanes', async () => {
        /*
          Goal: verify the template renders the sessions in their expected days and theaters
    
          Synopsis:
          - given: signals returning a list of sessions and activities covering several Days and Theaters
          - when: component is rendered in the DOM
          - then: the sessions appear in the expected swimlanes

          Desired assertions:
          1. for each provided PlannedMovieSession, a corresponding `app-planned-movie-session` node exists in the correct column for its theater and day
        */
        // Arrange: make the store signals return the test datasets (no sessions, activities only)
        mockStore.selectSignal = mockStoreSelector(
            [], 
            TEST_OTHER_ACTIVITIES
        )

        // Act: create component
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        await fixture.whenStable()

        ////////////////// Assert that the other activities are also correctly placed by day
        // helper function
        const getActivityColumn = (day: Day) => fixture.debugElement.query(By.css(`.testid-sc-sw-${day.key}-act`))
        // main loop
        for (const day of Days.enumerate()){
            const col = getActivityColumn(day)

            // collect the activities in all components in that column 
            const sortedActual = col.queryAll(By.directive(OtherActivityComponent))
                                        .map(de => de.componentInstance as OtherActivityComponent)
                                        .map(oa => oa.activity)
                                        .sort(sortPlannable)

            // collect the activities as returned by the component
            const sortedExpected = component.activitiesByDay(day).sort(sortPlannable)
            // both collection should be exactly equal
            expect(sortedExpected).toEqual(sortedActual)
        }
    })


    it.each<[Day, Theater]>(dayAndTheatersCombinations())("clicking %s %s header add buttons triggers openNewSession", 
        async (day: Day, theater: Theater) => {
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
        // Arrange
        mockStore.selectSignal = mockStoreSelector(
            TEST_PLANNED_SESSIONS, 
            []
        )

        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        const newSession = someSession()
        mockMatDialog.open = vi.fn()
                .mockReturnValueOnce({ afterClosed: () => of(newSession) })
                .mockReturnValueOnce({ afterClosed: () => of(undefined) })

        // When the button is clicked
        const helper = harnessHelper(loader)
        const button = await helper.button(`sc-header-${day.key}-${theater.key} button`)
        await button.click()
        await fixture.whenStable()

        // Assert the dialog has been called and the newSession was returned once
        expect(mockMatDialog.open).toHaveBeenCalled()
    })

    it.each(Days.enumerate())("clicking %s header activity add button triggers openNewActivity", 
        async (day: Day) => {
        /*
          Goal: ensure header buttons are wired to component handlers.

         Synopsis:
            - given: the component rendered in the DOM            
            - when: user clicks the 'add' button in the activity header
            - then: the component's `openNewActivity` is invoked

          UI actions (explicit):
          - find the button via harnessHelper + testid and perform `click()`

          Desired assertions:
          1. the component method spy is called with expected parameter (day)
        */
        // Arrange
        mockStore.selectSignal = mockStoreSelector(
            [],
            TEST_OTHER_ACTIVITIES
        )

        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
        
        const newActivity = someSession()
        mockMatDialog.open = vi.fn()
                .mockReturnValueOnce({ afterClosed: () => of(newActivity) })
                .mockReturnValueOnce({ afterClosed: () => of(undefined) })

        // When the button is clicked
        const helper = harnessHelper(loader)
        const button = await helper.button(`sc-header-${day.key}-act button`)
        await button.click()
        await fixture.whenStable()

        // Assert the dialog has been called and the newActivity was returned once
        expect(mockMatDialog.open).toHaveBeenCalled()
    })


    it('should rended sessions from top to bottom in the swimlane depending on their startTime', async () => {
        /*
          Goal: verify that sessions are rendered from top to bottom in a swimlane depending on their startTime
    
          Synopsis:
          - given: a set of sessions for a given day and theater with different startTimes
          - when: the component is rendered
          - then: the sessions are rendered from top to bottom in increasing order of startTime
    
          UI actions (explicit):
          - Render the component and inspect the order of rendered session components in a given swimlane
    
          Desired assertions:
          1. the order of rendered session components matches the order of their startTimes
        */
        // Arrange: sessions for a given day and theater with different startTimes
        const day = Days.FRIDAY
        const theater = Theaters.CASINO
        const session1 = defaultSession({ id: 1, day, theater, startTime: new Time(10, 0) })
        const session2 = defaultSession({ id: 2, day, theater, startTime: new Time(12, 0) })
        const session3 = defaultSession({ id: 3, day, theater, startTime: new Time(9, 0) })
        mockStore.selectSignal = mockStoreSelector([session1, session2, session3], [])

        // Act: create component
        fixture = TestBed.createComponent(SessionSectionComponent)
        component = fixture.componentInstance
        await fixture.whenStable()

        // Assert: sessions are rendered in order of startTime
        const col = fixture.debugElement.query(By.css(`.testid-sc-sw-${day.key}-${theater.key}`))
        
        const sortByTopPosition: (a: PlannedMovieSessionComponent, b: PlannedMovieSessionComponent) => number = (a, b) => {
            // Note: here we cannot ask directly for the top position because
            // the component is not styled in the test environment; we access the
            // internal _swlitem property instead and parse the computed pixel value.
            // This is a bit brittle but sufficient for this test.
            const aPos = a['_swlitem'].topPosInPixel.replace('px', '')
            const bPos = b['_swlitem'].topPosInPixel.replace('px', '')
            return parseInt(aPos) - parseInt(bPos)
        }
        const renderedSessions = col.queryAll(By.directive(PlannedMovieSessionComponent))
                                        .map(de => de.componentInstance as PlannedMovieSessionComponent)
                                        .sort(sortByTopPosition)
                                        .map(pms => pms.session)

        const expectedOrder = [session3, session1, session2] // sorted by startTime
        expect(renderedSessions).toEqual(expectedOrder)
    })

})

// Test data factories and helper values can be appended here when implementing the tests.

// -----------------------------------------------------------------------------
// Concrete test dataset: a dozen sessions and several other activities
// These deterministic fixtures are used by UI tests to validate rendering,
// placement and ordering by day/theater.
// -----------------------------------------------------------------------------


// **** Mocks ********* //

function mockStoreSelector(sessionsArr: PlannedMovieSession[], activitiesArr: OtherActivity[]=[]) {
    return (selector: any) => {
        if (selector === selectPlannedMovieSessions) return signal(sessionsArr)
        if (selector === selectActivities) return signal(activitiesArr)
        return signal([])
    }
}

// *********** Test Data ************** //

// Build a random number of sessions per day/theater combination
const sbuilder = sessionBuilder().for({})
dayAndTheatersCombinations().forEach( ([day, theater], index) => {
    const sub = sbuilder.with({day, theater})
    for (let i=0; i<=(index % 3)+1; i++){
        sub.add()
    }
    sub.done()
})

const TEST_PLANNED_SESSIONS: PlannedMovieSession[] = randomizedArray(sbuilder.done() as PlannedMovieSession[])

const TEST_OTHER_ACTIVITIES: OtherActivity[] = [
    defaultActivity({ id: 201, day: Days.FRIDAY, startTime: new Time(9, 0), endTime: new Time(9, 45), description: 'Setup' }),
    defaultActivity({ id: 203, day: Days.SATURDAY, startTime: new Time(12, 0), endTime: new Time(13, 0), description: 'Lunch Talk' }),
    defaultActivity({ id: 205, day: Days.WEDNESDAY, startTime: new Time(15, 0), endTime: new Time(16, 30), description: 'Panel' }),
    defaultActivity({ id: 202, day: Days.FRIDAY, startTime: new Time(17, 0), endTime: new Time(18, 0), description: 'Q&A' }),
    defaultActivity({ id: 206, day: Days.THURSDAY, startTime: new Time(19, 0), endTime: new Time(20, 0), description: 'Afterparty' }),
    defaultActivity({ id: 204, day: Days.SUNDAY, startTime: new Time(8, 30), endTime: new Time(9, 30), description: 'Breakfast Meetup' }),
]

function emptyRoadmap(): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
}

// ********** Utility methods *************** //

function sortPlannable(a: PlannableEvent, b: PlannableEvent): number {
    // first by day
    const dayDiff = a.day.compare(b.day)
    if (dayDiff !== 0) return dayDiff
    // then by startTime
    return a.startTime.compare(b.startTime)
}

function dayAndTheatersCombinations(): [Day, Theater][] {
    const combinations: [Day, Theater][] = []
    for (const day of Days.enumerate()) {
        for (const theater of Theaters.enumerate()) {
            combinations.push([day, theater])
        }
    }
    return combinations
}

function randomizedArray<T>(arr: T[]): T[] {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}