import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, it, beforeEach, vi, expect } from 'vitest'

import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'
import { of } from 'rxjs'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { PlannedMovieSessionComponent } from './planned-movie-session.component'
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model'
import { EventRating, EventRatings } from 'src/app/models/plannable.model'
import { RoadmapAuthor, FestivalRoadmap } from 'src/app/models/roadmap.model'
import { Durations, Times } from 'src/app/models/time.utils'
import { PlannedMovieSession } from 'src/app/models/session.model'
import { Days, Theaters, Day, Theater } from 'src/app/models/referential.data'
import { Time } from 'src/app/models/time.model'
import * as factories from 'src/_testhelpers/factories'
import { ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component'
import { after } from 'node:test'
import { toNamespacedPath } from 'node:path'

describe('PlannedMovieSessionComponent', () => {
  /**
   * Forewords:
   * - not all tests require a full roadmap. An empty roadmap can be used when the roadmap content is irrelevant.
   * 
   */

  // Shared fixtures / mocks
  let fixture: ComponentFixture<PlannedMovieSessionComponent>
  let component: PlannedMovieSessionComponent
  let mockMatDialog: any
  let mockDialogRef: any
  let mockStore: any
  let loader: HarnessLoader
  let helper: ReturnType<typeof harnessHelper>

  beforeEach(async () => {
    // baseline mocks (will be fine-tuned per-test)
    mockDialogRef = { afterClosed: () => of(null), componentInstance: {} }
    mockMatDialog = { open: vi.fn(() => mockDialogRef) }
    mockStore = { dispatch: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [PlannedMovieSessionComponent],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: Store, useValue: mockStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    // create fresh component instance for each test and reset spies
    fixture = TestBed.createComponent(PlannedMovieSessionComponent)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
    helper = harnessHelper(loader)

    mockMatDialog.open.mockReset()
    mockMatDialog.open.mockReturnValue(mockDialogRef)
    mockStore.dispatch = vi.fn()
  })

  // -------- Session information elements --------

  it('should create the component and render without errors', async () => {
    /*
      Goal: ensure component instantiates with valid inputs.

      Synopsis:
      - given: a valid PlannedMovieSession, both the movie and the session having DEFAULT ratings
      - and: a FestivalRoadmap (possibly empty, the roadmap is irrelevant here)
      - when: TestBed creates the component
      - then: the session data are set and visible in the component.

      Desired assertions:
      1. component is truthy
      2. the title element contains the movie title
      3. the time element contains the session start and end times
      4. no icons are shown
    */

    // Arrange: build a session using test factories, overriding only the values that matter
    const movie = factories.defaultMovie({ rating: MovieRatings.DEFAULT }) 
    const start = Times.fromString("10h00")
    const end = Times.add(start, movie.duration)
    const session = factories.defaultSession({
      movie: movie,
      startTime: start,
      rating: EventRatings.DEFAULT
    })
    const roadmap = emptyRoadmap()

    // Act: assign inputs on the shared component and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert: component exists
    expect(component).toBeTruthy()

    // Title element contains movie title
    const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('.swimlane-item-title')
    expect(titleEl).not.toBeNull()
    expect(titleEl!.textContent!.trim()).toBe(movie.title)

    // Time element contains start - end interval
    const expectedInterval = Times.toStrInterval(start, end)

    const timeEl: HTMLElement | null = fixture.nativeElement.querySelector('.swimlane-item-time')
    expect(timeEl).not.toBeNull()
    expect(timeEl!.textContent).toContain(expectedInterval)

    // Default ratings -> normal renderings
    expect(component.contentRendering).toBe('normal')
    expect(component.borderRendering).toBe('normal')

    // No icons should be displayed for default ratings
    const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.swimlane-item-icon')
    expect(icons.length).toBe(0)

    // "planned elsewhere" indicator must not be present
    const eventLink: HTMLElement | null = fixture.nativeElement.querySelector('app-event-link')
    expect(eventLink).toBeNull()
  })

  it('should display the rating icons if non-DEFAULT ratings are set', async () => {
    /*
      Goal: ensure icons are displayed if they should be.

      Synopsis:
      - given: a valid PlannedMovieSession, with both the movie and session having non-DEFAULT ratings
      - and: a FestivalRoadmap (possibly empty, the roadmap is irrelevant here)
      - when: TestBed creates the component
      - then: both icons are visible.

      Desired assertions:
      1. the icons for movie rating and session rating are present
    */

    // Arrange: build a session using test factories, overriding only the values that matter
    const movie = factories.defaultMovie({ rating: MovieRatings.HIGH })
    const session = factories.defaultSession({ movie: movie, rating: EventRatings.MANDATORY })
    const roadmap = emptyRoadmap()

    // Act: assign inputs on the shared component and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert: both rating components are present
    const movieRatingsEl: HTMLElement | null = fixture.nativeElement.querySelector('app-movie-ratings')
    const sessionRatingsEl: HTMLElement | null = fixture.nativeElement.querySelector('app-session-ratings')
    expect(movieRatingsEl).not.toBeNull()
    expect(sessionRatingsEl).not.toBeNull()
  })

  it('should display the "planned elsewhere" indicator if the movie is planned elsewhere', async () => {
    /*
      Goal: ensure the "planned elsewhere" indicator is shown when appropriate.

      Synopsis:
      - given: a session
      - and: a FestivalRoadmap that includes a different session for the same movie
      - when: TestBed creates the component
      - then: the "planned elsewhere" indicator is visible.

      Desired assertions:
      1. the <app-event-link> indicator is present
    */

    // Arrange: build a session using test factories, overriding only the values that matter
    const sameMovie = factories.someMovie()
    const session = factories.someSession({ movie: sameMovie})
    const otherSession = factories.someSession({ movie: sameMovie})

    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [otherSession], [])

    // Act: assign inputs on the shared component and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert internal state and DOM presence
    expect(component._isPlannedElsewhere()).toBe(true)
    const eventLink: HTMLElement | null = fixture.nativeElement.querySelector('app-event-link')
    expect(eventLink).not.toBeNull()
  })

  // -------- computed css classes --------

  it('contentRendering returns "outstanding" when session is in roadmap and author is MACHINE', async () => {
    /*
      Goal: verify outstanding precedence in content rendering.

      Synopsis:
      - given: roadmap.isInRoadmap(session) -> true and roadmap.author == RoadmapAuthor.MACHINE
      - when: reading `contentRendering`
      - then: value is "outstanding"

      Desired assertions:
      1. `contentRendering === 'outstanding'`
    */

    // Arrange: a session that is part of a roadmap authored by MACHINE
    const session = factories.defaultSession()
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [session], [])

    // Act: assign inputs on the shared component and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert: outstanding takes precedence
    expect(component.contentRendering).toBe('outstanding')
  })
  
  const contentRenderingCases: [string, MovieRating][] = [
    ['very-green', MovieRatings.HIGHEST],
    ['green', MovieRatings.HIGH],
    ['normal', MovieRatings.DEFAULT],
    ['disabled', MovieRatings.NEVER]
  ] 
  it.each<[string, MovieRating]>(contentRenderingCases)('contentRendering returns "%s" for rating MovieRating %s', 
    async (expectedClassname: string, rating: MovieRating) => {
    /*
      Goal: verify contentRendering for various movie ratings.

      Synopsis:
      - given: a session with movie.rating == rating and any roadmap
      - when: reading `contentRendering`
      - then: value is "expectedClassname"

      Desired assertions:
      1. `contentRendering === expectedClassname`
    */

    // Arrange: session with movie rating set according to the case
    const movie = factories.defaultMovie({ rating: rating })
    const session = factories.defaultSession({ movie: movie })
    const roadmap = emptyRoadmap()

    // Act: assign inputs and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert
    expect(component.contentRendering).toBe(expectedClassname)
  })

  it('borderRendering returns "outstanding" when session is in roadmap and author is MACHINE', async () => {
    /*
      Goal: verify outstanding precedence in border rendering.

      Synopsis:
      - given: roadmap.isInRoadmap(session) -> true and roadmap.author == RoadmapAuthor.MACHINE
      - when: reading `borderRendering`
      - then: value is "outstanding"

      Desired assertions:
      1. `borderRendering === 'outstanding'`
    */
    // Arrange: a session that is part of a roadmap authored by MACHINE
    const session = factories.defaultSession()
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [session], [])

    // Act: assign inputs on the shared component and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert: outstanding takes precedence
    expect(component.borderRendering).toBe('outstanding')
  })


  const borderRenderingCases: [string, EventRating][] = [
    ['salient', EventRatings.MANDATORY],
    ['normal', EventRatings.DEFAULT],
    ['disabled', EventRatings.NEVER]
  ]
  it.each<[string, EventRating]>(borderRenderingCases)('borderRendering returns "%s" for EventRating %s', 
    async (expectedClassname, rating) => {
    /*
      Goal: verify borderRendering for various session ratings.

      Synopsis:
      - given: a session with session.rating == rating and any roadmap
      - when: reading `borderRendering`
      - then: value is `expectedClassname`

      Desired assertions:
      1. `borderRendering === expectedClassname`
    */

    // Arrange: session with session.rating set according to the case
    const session = factories.defaultSession({ rating: rating })
    const roadmap = emptyRoadmap()

    // Act: assign inputs and render
    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // Assert
    expect(component.borderRendering).toBe(expectedClassname)
  })


  // -------- Interaction / dialog / store tests --------

  it('update() opens SessionDialog and dispatches update_session when closed with data', async () => {
    /*
      Goal: test that updating a session works end to end.

      Synopsis:
      - given: a PlannedMovieSession and any roadmap
      - and: the dialog afterClosed yields an updated PlannedMovieSession (different from the original)
      - when: the user double-clicks to update the session
      - then: checkChangesRequireReload called and Store.dispatch called with update_session containing toMovieSession() and thenReload

      Desired assertions:
      1. MatDialog.open called with SessionDialog and session.copy()
      2. Store.dispatch called with SessionActions.update_session and correct payload
    */
    // Arrange
    const session = factories.defaultSession()
    const updated = session.copy({ day: Days.SATURDAY })
    const roadmap = emptyRoadmap()

    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // prepare dialog to return updated session
    const dialogRef = { afterClosed: () => of(updated) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.update()

    // Assert: dialog opened with SessionDialog and data matching a copy of session
    expect(mockMatDialog.open).toHaveBeenCalled()
    const openArgs = mockMatDialog.open.mock.calls[0]
    expect(openArgs[1].data).toEqual(session)

    // Store.dispatch must have been called with update_session and correct payload
    expect(mockStore.dispatch).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.session).toEqual(updated.toMovieSession())
    const expectedThenReload = session.checkChangesRequireReload(updated)
    expect(dispatched.thenReload).toBe(expectedThenReload)
  })

  it('update() does not dispatch when dialog afterClosed yields falsy', async () => {
    /*
      Goal: ensure no dispatch when user cancels.

      Synopsis:
      - given:  a planned session and any roadmap
      - and: the dialog afterClosed yields undefined
      - when: the user double-clicks to update the session
      - then: no Store.dispatch calls

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    const session = factories.defaultSession()
    const roadmap = emptyRoadmap()

    component.session = session
    component.roadmap = roadmap
    fixture.detectChanges()

    // dialog will close with undefined
    const dialogRef = { afterClosed: () => of(undefined) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.update()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  it('updateRating() opens EventRatingMenu and updates when rating changed', async () => {
    /*
      Goal: verify rating menu anchor and update path when rating changes.

      Synopsis:
      - given: a session and any roadmap
      - and : the dialog afterClosed yields a different rating than the session.rating
      - when: the user right-clicks to update the rating
      - then: modified session created and Store.dispatch called with update_session(payload)

      Desired assertions:
      1. MatDialog.open called with anchor equal to component._swlitem and correct eventRating
      2. Store.dispatch called with update_session and toMovieSession() payload
    */
    // Arrange
    const session = factories.defaultSession()
    const roadmap = emptyRoadmap()
    component.session = session
    component.roadmap = roadmap
    // ensure anchor exists
    component['_swlitem'] = { id: 'anchor' } as any
    fixture.detectChanges()

    // dialog returns void (that's how this one works) but componentInstance.eventRating is modified
    const newRating = EventRatings.MANDATORY
    const dialogRef = { afterClosed: () => of(null), componentInstance: { eventRating: newRating } }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.updateRating()

    // Assert: dialog opened with EventRatingMenu and correct data anchor + eventRating
    expect(mockMatDialog.open).toHaveBeenCalled()
    const openArgs = mockMatDialog.open.mock.calls[0]
    const opts = openArgs[1]
    expect(opts.data).toEqual({ anchor: component['_swlitem'], eventRating: session.rating })

    // Store.dispatch called with update_session and modified session
    expect(mockStore.dispatch).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.session).toEqual(session.copy({ rating: newRating }).toMovieSession())
  })

  it('updateRating() does not dispatch when rating remains unchanged', async () => {
    /*
      Goal: ensure no dispatch when rating not changed.

      Synopsis:
      - given: a session and any roadmap
      - and : the dialog componentInstance.eventRating equals original session.rating
      - when: the user right-clicks to update the rating
      - then: no Store.dispatch

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    const session = factories.defaultSession()
    const roadmap = emptyRoadmap()
    component.session = session
    component.roadmap = roadmap
    component['_swlitem'] = {} as any
    fixture.detectChanges()

    // dialog componentInstance.eventRating equals original session.rating
    const dialogRef = { afterClosed: () => of(null), componentInstance: { eventRating: session.rating } }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.updateRating()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  it('confirmThenDelete() opens confirm dialog and dispatches delete_session on confirm', async () => {
    /*
      Goal: verify delete confirmation flow.

      Synopsis:
      - given: a session and any roadmap
      - the confirm dialog afterClosed yields ConfirmOutput.CONFIRM
      - when: the user clicks on the delete button
      - then: Store.dispatch called with delete_session and session.toMovieSession()

      Desired assertions:
      1. MatDialog.open called with GenericPurposeDialog and confirm type
      2. Store.dispatch called with delete_session payload
    */
    // Arrange
    component.session = factories.defaultSession()
    component.roadmap = emptyRoadmap()
    fixture.detectChanges()

    const dialogRef = { afterClosed: () => of(ConfirmOutput.CONFIRM) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.confirmThenDelete()

    // Assert
    expect(mockMatDialog.open).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.session).toEqual(component.session.toMovieSession())
  })

  it('confirmThenDelete() does not dispatch when user cancels', async () => {
    /*
      Goal: ensure cancel avoids deletion.

      Synopsis:
      - given: a session and any roadmap
      - and: the confirm dialog afterClosed yields ConfirmOutput.CANCEL
      - when: the user clicks on the delete button
      - then: no Store.dispatch

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    component.session = factories.defaultSession()
    component.roadmap = emptyRoadmap()
    fixture.detectChanges()

    const dialogRef = { afterClosed: () => of(ConfirmOutput.CANCEL) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.confirmThenDelete()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  // -------- Edge / negative tests --------

  it('_isNeverRated() returns true when movie.rating or session.rating is NEVER', async () => {
    /*
      Goal: confirm never-rated detection when movie.rating or session.rating is NEVER

      Synopsis:
      - given: movie.rating == MovieRatings.NEVER or session.rating == EventRatings.NEVER
      - when: calling `_isNeverRated()`
      - then: returns true

      Desired assertions:
      1. `_isNeverRated()` true for movie NEVER
      2. `_isNeverRated()` true for session NEVER
    */
  })

  it('_isPlannedElsewhere is true if the movie is planned elsewhere', async () => {
    /*
      Goal: validate planned-elsewhere boolean logic.

      Synopsis:
      - given: a session, and a roadmap where the movie is planned but the session is not
      - when: calling `_isPlannedElsewhere()`
      - then: returns true; and false when session also in roadmap

      Desired assertions:
      1. true when movie in roadmap and session not
      2. false when this very session is also in roadmap

      Note: 
    */
  })


  // *************** Test configuration ***************
  
  /**
   * Mocks the dialog for the confirm-then-delete dialog.
   * The afterClosed observable emits the provided answer.
   * 
   * @param answer 
   * @returns 
   */
  function mockConfirmDialog(answer: ConfirmOutput){
    const closed$ = of(answer)
    const dialogRef = {
      afterClosed: () => closed$,
      componentInstance: {}
    }
      const dialogMock = { open: vi.fn(() => dialogRef) }
      return dialogMock
  }

  // ********* other test data ***************
  function emptyRoadmap(): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
  }
})

