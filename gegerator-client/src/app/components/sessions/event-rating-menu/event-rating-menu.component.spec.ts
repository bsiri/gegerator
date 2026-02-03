import { beforeEach, describe, it, expect, vi } from 'vitest'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { EventRatingMenu } from './event-rating-menu.component'
import { EventRatings, EventRating } from 'src/app/models/plannable.model'
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatRadioModule } from '@angular/material/radio'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'


describe('EventRatingMenu UI', () => {
  let fixture: ComponentFixture<EventRatingMenu>
  let component: EventRatingMenu
  let loader: HarnessLoader

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: { componentInstance: {}, updatePosition: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { anchor: mockAnchor, eventRating: initialRating } }
      ]
    })

    fixture = TestBed.createComponent(EventRatingMenu)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
  })


  it('should render one radio button per EventRatings.enumerate()', async () => {
    /*
      Goal: Ensure the template renders one <mat-radio-button> per rating.

      Synopsis:
      - given: the component is created with MAT_DIALOG_DATA providing an initial rating
      - when: the template is initialized
      - then:
        1. the number of radio buttons equals EventRatings.enumerate().length
        2. each radio label matches the corresponding rating.description
    */
    const helper = harnessHelper(loader)

    fixture.detectChanges()
    await fixture.whenStable()

    const radioGroup = await helper.radiogroup()
    const buttons = await radioGroup.getRadioButtons()

    expect(buttons.length).toBe(EventRatings.enumerate().length)

    const labels = await Promise.all(buttons.map(b => b.getLabelText()))
    const expected = EventRatings.enumerate().map(er => er.description)
    expect(labels).toEqual(expected)
  })

  it('should pre-select the radio corresponding to the injected eventRating', async () => {
    /*
      Goal: Verify that the radio matching MAT_DIALOG_DATA.eventRating is checked on render.

      Synopsis:
      - given: MAT_DIALOG_DATA.eventRating set to a known EventRating (e.g. EventRatings.DEFAULT)
      - when: the view is initialized
      - then:
        1. the radio for that rating has the checked state
        2. other radios are not checked
    */
    const helper = harnessHelper(loader)

    fixture.detectChanges()
    await fixture.whenStable()

    const radioGroup = await helper.radiogroup()
    const checked = await radioGroup.getCheckedRadioButton()
    const value = await checked?.getValue()

    expect(value).toBe(initialRating.key)
  })

  it('should update component.eventRating and the DOM when a different rating is selected', async () => {
    /*
      Goal: Simulate a user changing the selection and assert both component state
            and rendered DOM update accordingly.

      Synopsis:
      - given: initial eventRating A is provided via MAT_DIALOG_DATA
      - when: the user selects rating B (simulate click or dispatch MatRadioChange)
      - then:
        1. component.eventRating equals B
        2. the radio for B is checked in the DOM
        3. the previous radio (A) is no longer checked
    */
    const helper = harnessHelper(loader)

    fixture.detectChanges()
    await fixture.whenStable()

    const radioGroup = await helper.radiogroup()

    // select the NEVER rating via its label
    const targetLabel = EventRatings.NEVER.description
    const targetButtons = await radioGroup.getRadioButtons({ label: targetLabel })
    await targetButtons[0].check()
    await fixture.whenStable()

    // component state updated
    expect(component.eventRating).toBe(EventRatings.NEVER)

    // DOM updated: checked radio corresponds to NEVER
    const checked = await radioGroup.getCheckedRadioButton()
    const checkedValue = await checked?.getValue()
    expect(checkedValue).toBe(EventRatings.NEVER.key)

    // previous (initial) is not checked
    const initialButtons = await radioGroup.getRadioButtons({ label: initialRating.description })
    const initialChecked = await initialButtons[0].isChecked()
    expect(initialChecked).toBe(false)
  })

  it('should render a context-menu host element bound to the provided anchor', async () => {
    /*
      Goal: Ensure the element with the `appContextMenu` directive exists and receives
            the provided `_anchor` and `dialogRef` bindings.

      Synopsis:
      - given: MAT_DIALOG_DATA.anchor is a mock ContextMenuRecipient
      - when: the component is rendered
      - then:
        1. an element with the context-menu directive is present
        2. its inputs (recipient/dialogRef) are provided (assert via directive instance or DOM markers)
    */
    fixture.detectChanges()
    await fixture.whenStable()

    const host = fixture.debugElement.query(By.css('.ctxt-menu'))
    expect(host).toBeTruthy()

    // The component should have stored the anchor from MAT_DIALOG_DATA
    expect(component._anchor).toBe(mockAnchor)
  })

})


// ------------------ Test data & mocks ------------------

/* Minimal mock anchor used in tests. Using DOMRect to mimic a real anchor location. */
export const mockAnchor: ContextMenuRecipient = {
  location: new DOMRect(0, 0, 100, 50)
}

/* Initial rating to use in tests. */
export const initialRating: EventRating = EventRatings.DEFAULT

/* A minimal mock for MatDialogRef which tests can extend or replace as needed. */
export const mockDialogRef = {
  componentInstance: {},
  updatePosition: () => {}
} as any
