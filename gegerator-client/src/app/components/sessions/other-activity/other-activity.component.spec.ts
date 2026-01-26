import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, it, beforeEach, vi, expect } from 'vitest'

import { NO_ERRORS_SCHEMA } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { OtherActivityComponent } from './other-activity.component'
import { EventRatings } from 'src/app/models/plannable.model'
import { RoadmapAuthor, FestivalRoadmap } from 'src/app/models/roadmap.model'
import * as factories from 'src/_testhelpers/factories'
import { ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component'

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

      Notes for implementation:
      - assign `component.activity = factories.defaultActivity({ rating: EventRatings.DEFAULT })`
      - set `component.roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])`
      - call `fixture.detectChanges()` and `await fixture.whenStable()` then query the DOM
    */
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

      Notes for implementation:
      - assign `component.activity = factories.defaultActivity({ rating: EventRatings.NEVER })`
      - call `fixture.detectChanges()` and `await fixture.whenStable()` then query the DOM
    */
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

      Implementation notes:
      - create an activity, create a FestivalRoadmap authored by MACHINE containing the activity
      - assign inputs and call `fixture.detectChanges()` if needed
      - assert on `component.contentRendering`
    */
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

      Implementation notes:
      - build activity via factories.defaultActivity({ rating }) or similar
      - assign and assert on `component.borderRendering`
    */
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

      Implementation notes:
      - set `component.activity`
      - stub `mockMatDialog.open` to return an object with `afterClosed: () => of(updatedActivity)`
      - call `component.update()` and assert `mockStore.dispatch` called with expected action
      - IMPORTANT: simulate the user triggering the update pathway by dispatching the `requestUpdate`
        event on the `app-swimlane-item` host element (or perform the UI double-click) so the
        `(requestUpdate)` output binding fires and the test covers the same code paths as a user.
    */
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

      Implementation notes:
      - ensure `component['_swlitem']` is set to a mock anchor
      - stub `mockMatDialog.open` to return `componentInstance: { eventRating: newRating }` and `afterClosed` observable
      - IMPORTANT: simulate the user interaction that opens the rating menu by dispatching the
        `requestContextMenu` event (or firing a `contextmenu` event) on the `app-swimlane-item` host
        element so Angular output bindings are exercised.
    */
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
      - IMPORTANT: trigger the deletion flow by dispatching the `requestDelete` event (or clicking
        the delete control in the swimlane item) so the `(requestDelete)` binding is exercised.
    */
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
  })

})
