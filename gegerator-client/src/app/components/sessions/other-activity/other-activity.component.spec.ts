import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, it, beforeEach, vi, expect } from 'vitest'

import { NO_ERRORS_SCHEMA } from '@angular/core'
import { of } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { OtherActivityComponent } from './other-activity.component'
import { EventRatings } from 'src/app/models/plannable.model'
import { RoadmapAuthor, FestivalRoadmap } from 'src/app/models/roadmap.model'
import * as factories from 'src/_testhelpers/factories'
import { ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component'
import { Times } from 'src/app/models/time.utils'
import { OtherActivity } from 'src/app/models/activity.model'

describe('OtherActivityComponent', () => {
  // Shared fixtures / mocks
  let fixture: ComponentFixture<OtherActivityComponent>
  let component: OtherActivityComponent
  let mockMatDialog: any
  let mockStore: any

  beforeEach(() => {
    mockMatDialog = { open: () => { 
        throw new Error("Should be overriden in tests that actually "+
        "use a dialog, according to the objectives of the test")} 
    }
    mockStore = { dispatch: vi.fn() }

    TestBed.configureTestingModule({
      imports: [OtherActivityComponent],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: Store, useValue: mockStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(OtherActivityComponent)
    component = fixture.componentInstance
  })

  // -------- Basic rendering / UI --------

  it('renders no icons when activity.rating is DEFAULT', async () => {
    /*
      Goal: when the activity rating is DEFAULT the component renders normally and no
      "never-rated" icon is shown.

      Synopsis:
      - given: an OtherActivity built with rating == EventRatings.DEFAULT
      - when: the component is created and inputs assigned
      - then: the DOM displays the `app-session-ratings` element but no icon indicating
        a NEVER rating is present.

      Desired tests and assertions:
      1. component is truthy
      2. `app-session-ratings` element is present
      3. no element matching `.swimlane-item-icon` exists (or the icon container is empty)
      4. `component.contentRendering` equals "normal"
    */
    // Arrange
    component.activity = factories.defaultActivity({ rating: EventRatings.DEFAULT })
    component.roadmap = emptyRoadmap()

    // Act
    await fixture.whenStable()

    // Assert
    // description show in title
    const host: HTMLElement | null = fixture.nativeElement.querySelector('app-swimlane-item')
    expect(host).not.toBeNull()
    expect(host!.textContent).toContain(component.activity.description)

    // start end end time are shown
    const expectedInterval = Times.toStrInterval(component.activity.startTime, component.activity.endTime)
    const timeEl: HTMLElement | null = fixture.nativeElement.querySelector('.swimlane-item-time')
    expect(timeEl).not.toBeNull()
    expect(timeEl!.textContent).toContain(expectedInterval)

    // no icons shown 
    const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.swimlane-item-icon')
    expect(icons.length).toBe(0)
    expect(component.contentRendering).toBe('normal')
  })

  it('renders the never-icon when activity.rating is NEVER', async () => {
    /*
      Goal: when the activity rating is NEVER an explicit icon/indicator is shown.

      Synopsis:
      - given: an OtherActivity built with rating == EventRatings.NEVER
      - when: the component is created and inputs assigned
      - then: the DOM displays an icon indicating the NEVER rating

      Desired tests and assertions:
      1. component is truthy
      2. `app-session-ratings` element is present
      3. an element matching `.swimlane-item-icon` exists (icon shown)
      4. `component.contentRendering` equals "disabled"
    */
    // Arrange
    component.activity = factories.defaultActivity({ rating: EventRatings.NEVER })
    component.roadmap = emptyRoadmap()

    // Act
    await fixture.whenStable()

    // Assert
    expect(component).toBeTruthy()
    const ratingsEl: HTMLElement | null = fixture.nativeElement.querySelector('app-session-ratings')
    expect(ratingsEl).not.toBeNull()
    // the session-ratings component renders a span with class session-never
    const neverIcon = fixture.nativeElement.querySelector('.session-never')
    expect(neverIcon).not.toBeNull()
    expect(component.contentRendering).toBe('disabled')
  })

  // -------- contentRendering / borderRendering behavior --------

  it('contentRendering returns "outstanding" when activity is in roadmap and author is MACHINE', async () => {
    /*
      Goal: verify outstanding precedence in content rendering.

      Synopsis:
      - given: roadmap.isInRoadmap(activity) -> true and roadmap.author == RoadmapAuthor.MACHINE
      - when: reading `contentRendering`
      - then: value is "outstanding"

      Desired assertions:
      1. `contentRendering === 'outstanding'`

    */
    const activity = factories.defaultActivity()
    const roadmap = machineRoadmap(activity)

    component.activity = activity
    component.roadmap = roadmap
    await fixture.whenStable()

    expect(component.contentRendering).toBe('outstanding')
  })

  it('contentRendering returns "disabled" when activity.rating is NEVER', async () => {
    /*
      Goal: verify contentRendering disabled state for NEVER rating.

      Synopsis:
      - given: an activity with rating == EventRatings.NEVER
      - when: reading `contentRendering`
      - then: value is "disabled"

      Desired assertions:
      1. `contentRendering === 'disabled'`
    */
    component.activity = factories.defaultActivity({ rating: EventRatings.NEVER })
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    expect(component.contentRendering).toBe('disabled')
  })

  it('contentRendering returns "normal" for non-NEVER non-outstanding activities', async () => {
    /*
      Goal: verify default contentRendering.

      Synopsis:
      - given: an activity with a default rating and a non-outstanding roadmap
      - when: reading `contentRendering`
      - then: value is "normal"

      Desired assertions:
      1. `contentRendering === 'normal'`
    */
    component.activity = factories.defaultActivity({ rating: EventRatings.DEFAULT })
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    expect(component.contentRendering).toBe('normal')
  })

  it('borderRendering returns "outstanding" when activity is in roadmap and author is MACHINE', async () => {
    /*
      Goal: verify outstanding precedence in border rendering.

      Synopsis:
      - given: roadmap.isInRoadmap(activity) -> true and roadmap.author == RoadmapAuthor.MACHINE
      - when: reading `borderRendering`
      - then: value is "outstanding"

      Desired assertions:
      1. `borderRendering === 'outstanding'`
    */
    const activity = factories.defaultActivity()
    const roadmap = machineRoadmap(activity)

    component.activity = activity
    component.roadmap = roadmap
    await fixture.whenStable()

    expect(component.borderRendering).toBe('outstanding')
  })

  const borderRenderingCases: [string, any][] = [
    ['salient', EventRatings.MANDATORY],
    ['normal', EventRatings.DEFAULT],
    ['disabled', EventRatings.NEVER]
  ]
  it.each(borderRenderingCases)('borderRendering returns "%s" for EventRating %s', async (expectedClassname, rating) => {
    /*
      Goal: verify borderRendering for various activity ratings.

      Synopsis:
      - given: an activity with activity.rating == rating and any roadmap
      - when: reading `borderRendering`
      - then: value is expectedClassname

      Desired assertions:
      1. `borderRendering === expectedClassname`

    */
    component.activity = factories.defaultActivity({ rating })
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    expect(component.borderRendering).toBe(expectedClassname)
  })

  // -------- Interaction / dialog / store tests --------

  it('update() opens Activitydialog and dispatches update_activity when closed with data', async () => {
    /*
      Goal: test that updating an activity works end to end.

      Synopsis:
      - given: an OtherActivity and any roadmap
      - and: the dialog afterClosed yields an updated OtherActivity
      - when: the user triggers `update()`
      - then: Store.dispatch called with ActivityActions.update_activity and the updated activity

      Desired assertions:
      1. MatDialog.open called with Activitydialog and a clone of the activity
      2. Store.dispatch called with update_activity and correct payload
    */
    // Arrange
    const activity = factories.defaultActivity()
    component.activity = activity
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    const updated = activity.copy({ description: activity.description + ' updated' })
    const dialogRef = { afterClosed: () => of(updated) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act: trigger the requestUpdate output by dispatching the custom event on the host element
    triggerRequestUpdate(fixture, 'requestUpdate')
    await fixture.whenStable()

    // Assert
    expect(mockMatDialog.open).toHaveBeenCalled()
    const openArgs = mockMatDialog.open.mock.calls[0]
    expect(openArgs[1].data).toEqual(activity)
    expect(mockStore.dispatch).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.activity).toEqual(updated)
  })

  it('update() does not dispatch when dialog afterClosed yields falsy', async () => {
    /*
      Goal: ensure cancel avoids update dispatch.

      Synopsis:
      - given: a planned activity
      - and: the dialog afterClosed yields undefined
      - when: the user triggers `update()`
      - then: no Store.dispatch

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    const activity = factories.defaultActivity()
    component.activity = activity
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    const dialogRef = { afterClosed: () => of(undefined) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.update()
    await fixture.whenStable()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  it('updateRating() opens EventRatingMenu and updates when rating changed', async () => {
    /*
      Goal: verify rating menu anchor and update path when rating changes.

      Synopsis:
      - given: an activity and any roadmap
      - and: the dialog afterClosed yields (componentInstance.eventRating != activity.rating)
      - when: the user triggers `updateRating()`
      - then: Store.dispatch called with ActivityActions.update_activity and updated activity

      Desired assertions:
      1. MatDialog.open called with anchor equal to component._swlitem and correct eventRating
      2. Store.dispatch called with update_activity and modified activity
    */
    // Arrange
    const activity = factories.defaultActivity()
    component.activity = activity
    component.roadmap = emptyRoadmap()
    component['_swlitem'] = { id: 'anchor' } as any
    await fixture.whenStable()

    const newRating = EventRatings.MANDATORY
    const dialogRef = { afterClosed: () => of(null), componentInstance: { eventRating: newRating } }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act: trigger requestContextMenu
    triggerRequestUpdate(fixture, 'requestContextMenu')
    await fixture.whenStable()

    // Assert
    expect(mockMatDialog.open).toHaveBeenCalled()
    const openArgs = mockMatDialog.open.mock.calls[0]
    const opts = openArgs[1]
    expect(opts.data).toEqual({ anchor: component['_swlitem'], eventRating: activity.rating })
    expect(mockStore.dispatch).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.activity).toEqual(activity.copy({ rating: newRating }))
  })

  it('updateRating() does not dispatch when rating remains unchanged', async () => {
    /*
      Goal: ensure no dispatch when rating not changed.

      Synopsis:
      - given: an activity and any roadmap
      - and: the dialog componentInstance.eventRating equals original activity.rating
      - when: `updateRating()` is called
      - then: no Store.dispatch

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    const activity = factories.defaultActivity()
    component.activity = activity
    component.roadmap = emptyRoadmap()
    component['_swlitem'] = {} as any
    await fixture.whenStable()

    const dialogRef = { afterClosed: () => of(null), componentInstance: { eventRating: activity.rating } }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.updateRating()
    await fixture.whenStable()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  it('confirmThenDelete() opens confirm dialog and dispatches delete_activity on confirm', async () => {
    /*
      Goal: verify delete confirmation flow.

      Synopsis:
      - given: an activity and any roadmap
      - the confirm dialog afterClosed yields ConfirmOutput.CONFIRM
      - when: `confirmThenDelete()` is called
      - then: Store.dispatch called with ActivityActions.delete_activity and activity

      Desired assertions:
      1. MatDialog.open called with GenericPurposeDialog and confirm type
      2. Store.dispatch called with delete_activity payload
    */
    // Arrange
    component.activity = factories.defaultActivity()
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    const dialogRef = { afterClosed: () => of(ConfirmOutput.CONFIRM) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act: trigger requestDelete
    triggerRequestUpdate(fixture, 'requestDelete')
    await fixture.whenStable()

    // Assert
    expect(mockMatDialog.open).toHaveBeenCalled()
    expect(mockStore.dispatch).toHaveBeenCalled()
    const dispatched = mockStore.dispatch.mock.calls[0][0]
    expect(dispatched.activity).toEqual(component.activity)
  })

  it('confirmThenDelete() does not dispatch when user cancels', async () => {
    /*
      Goal: ensure cancel avoids deletion.

      Synopsis:
      - given: an activity and any roadmap
      - and: the confirm dialog afterClosed yields ConfirmOutput.CANCEL
      - when: `confirmThenDelete()` is called
      - then: no Store.dispatch

      Desired assertions:
      1. Store.dispatch not called
    */
    // Arrange
    component.activity = factories.defaultActivity()
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()

    const dialogRef = { afterClosed: () => of(ConfirmOutput.CANCEL) }
    mockMatDialog.open = vi.fn(() => dialogRef)

    // Act
    component.confirmThenDelete()
    await fixture.whenStable()

    // Assert
    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  // -------- Edge / negative tests --------

  it('_isOutstanding() returns true when activity is in roadmap and author is MACHINE', async () => {
    /*
      Goal: validate outstanding boolean logic.

      Synopsis:
      - given: an activity, and a roadmap where the activity is present and author is MACHINE
      - when: calling `_isOutstanding()`
      - then: returns true; false otherwise

      Desired assertions:
      1. true when activity in roadmap and author MACHINE
      2. false when activity not in roadmap or author is HUMAN
    */
    const activity = factories.defaultActivity()

    // True when activity in roadmap and author MACHINE
    component.activity = activity
    component.roadmap = machineRoadmap(activity)
    await fixture.whenStable()
    expect(component._isOutstanding()).toBe(true)

    // False when activity not in roadmap
    component.roadmap = emptyRoadmap()
    await fixture.whenStable()
    expect(component._isOutstanding()).toBe(false)

    // False when author is HUMAN even if activity present
    component.roadmap = humanRoadmap(activity)
    await fixture.whenStable()
    expect(component._isOutstanding()).toBe(false)
  })

})


// ************ helper functions ************* //

function emptyRoadmap(): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
}

function machineRoadmap(activity: OtherActivity): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.MACHINE, [], [activity])
}

function humanRoadmap(activity: OtherActivity): FestivalRoadmap {
    return new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [activity])
}

/**
 * Helpers to trigger the requestUpdate or requestContextMenu events
 * @param fixture  * 
 * @param eventName 
 */
function triggerRequestUpdate(fixture: ComponentFixture<OtherActivityComponent>, eventName: string): void {
  const host: HTMLElement | null = fixture.nativeElement.querySelector('app-swimlane-item')
  expect(host).not.toBeNull()
  host!.dispatchEvent(new CustomEvent(eventName, { bubbles: true }))
}