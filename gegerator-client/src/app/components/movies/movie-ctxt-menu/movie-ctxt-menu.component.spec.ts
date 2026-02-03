import { describe, it, beforeEach, expect, vi } from 'vitest'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { MovieCtxtMenu } from './movie-ctxt-menu.component'
import { MovieRatings } from 'src/app/models/movie.model'
import { PlannedMovieSession } from 'src/app/models/session.model'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { Times } from 'src/app/models/time.utils'
import { Days } from 'src/app/models/referential.data'
import { MatRadioModule } from '@angular/material/radio'
import { HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { harnessHelper } from 'src/_testhelpers/harnesshelper'
import { By } from '@angular/platform-browser'
import * as factories from 'src/_testhelpers/factories'

describe('MovieCtxtMenu (component + unit)', () => {
  let fixture: ComponentFixture<MovieCtxtMenu>
  let component: MovieCtxtMenu
  let loader: HarnessLoader

  /*
    Setup for each test:
    - create TestBed and configure the component with minimal stubs/mocks
    - provide a fake Store.selectSignal returning a signal of PlannedMovieSession[]
    - provide MAT_DIALOG_DATA with a MovieCtxtMenuModel containing a Movie instance
    - provide a fake MatDialogRef

    Note: Implementation details (TestBed.configureTestingModule, creating fixture)
    are intentionally omitted here – these tests are outlines only.
  */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn(), updatePosition: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { movie: movieInstance(), anchor: anchorMock } },
        { provide: Store, useValue: { selectSignal: () => signal(sessions) } }
      ]
    })
    fixture = TestBed.createComponent(MovieCtxtMenu)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
  })

  // UI Tests
  it('should create the component and render radio buttons enumerating MovieRatings', async () => {
    /*
      Goal: ensure component instantiates and the template contains one radio button per
      entry returned by MovieRatings.enumerate().

      Synopsis:
      - given: a Movie with any rating and a small MovieRatings.enumerate() set
      - when: component is created and change detection run
      - then: number of rendered <mat-radio-button> equals MovieRatings.enumerate().length

      Desired assertions (order):
      1. component is truthy
      2. querySelectorAll('mat-radio-button').length === MovieRatings.enumerate().length
    */
    const helper = harnessHelper(loader)

    fixture.detectChanges()
    await fixture.whenStable()

    // Assert all the radio buttons are rendered
    const radioHarnesses = await helper.radiogroup("mr-ratings")
    const buttons = await radioHarnesses.getRadioButtons()
    expect(buttons.length).toBe(MovieRatings.enumerate().length)

    // Assert the correct radio button is checked based on movie.rating
    const initRadiobutton = await radioHarnesses.getCheckedRadioButton()
    const initValue = await initRadiobutton?.getValue()
    expect(initValue).toBe(movieInstance().rating.key)
  })

  it('should update movie.rating when a radio change event is triggered', async () => {
    /*
      Goal: simulate a change event coming from the MatRadioGroup and ensure
      updateMovieRating mutates component.movie.rating accordingly.

      Synopsis:
      - given: a Movie with initial rating A
      - when: call component.updateMovieRating({ value: B } as MatRadioChange)
      - then: component.movie.rating === B

      Desired assertions:
      1. initial movie.rating === A
      2. after calling updateMovieRating, movie.rating === B
    */
    const helper = harnessHelper(loader)
    await fixture.whenStable()

    const radioHarnesses = await helper.radiogroup("mr-ratings")
    const neverRadiobutton = (await radioHarnesses.getRadioButtons({label: MovieRatings.NEVER.description}))[0]
    await neverRadiobutton.check()
    await fixture.whenStable()

    expect(component.movie.rating).toBe(MovieRatings.NEVER)

  })

  it('should render the correct number of session links filtered by movie.id', async () => {
    /*
      Goal: ensure only sessions whose session.movie.id === movie.id are rendered.

      Synopsis:
      - given: a mix of PlannedMovieSession entries some with movie.id matching component.movie.id
      - when: component is created and change detection run
      - then: the rendered <li> count equals the number of matching sessions

      Desired assertions:
      1. number of <li> in the planned sessions list equals filtered count
      2. each rendered session corresponds to a session with the expected movie.id
    */
    const expectedNumberOfSessions = 4
    await fixture.whenStable()

    const lis = fixture.debugElement.queryAll(By.css('ul li'))
    expect(lis.length).toBe(expectedNumberOfSessions)
  })

  it('should only retain sessions for the current movie', async () => {
    /*
      Goal: ensure that sessions for other movies are not included in the rendered list.

      Synopsis:
      - given: a set of PlannedMovieSession entries including some for other movies
      - when: component is created and change detection run
      - then: no rendered session corresponds to a session with a different movie.id

      Desired assertions:
      1. explicitly assert that "otherSession" (for a different movie) is not in component.$sessions()
        so that the Copilot code-reviewer won't complain that this variable is not used.
    */
    await fixture.whenStable()
    expect(component.$sessions()).not.toContain(otherSession)
  })

  it('should render sessions ordered by day then startTime (ascending)', async () => {
    /*
      Goal: verify that the visible session list is ordered by the 'day' then 'startTime'
      attributes as enforced by OrderByComparablePipe.

      Synopsis:
      - given: sessions for the same movie in shuffled order with different day/startTime
      - when: component renders and the pipe runs
      - then: the textual or DOM order of session entries corresponds to sorting by day then startTime

      Desired assertions:
      1. extract the sequence of session ids from rendered list and assert it matches expected sorted order
    */
    await fixture.whenStable()

    const lis = fixture.debugElement.queryAll(By.css('ul li'))
    const texts = lis.map(li => li.nativeElement.textContent.trim())

    // Expected order: wednesdaySession, fridaySession, sundaySession
    // The session about the other movie should not be present (see dataset)
    const format = (s: PlannedMovieSession) => `${s.format('%t : %d, %h')}`
    expect(texts.length).toBe(4)
    expect(texts[0]).toEqual(format(wednesdayMorningSession))
    expect(texts[1]).toEqual(format(wednesdayAfternoonSession))
    expect(texts[2]).toEqual(format(fridaySession))
    expect(texts[3]).toEqual(format(sundaySession))
  })

});

// ********************* datasets ************************* //

/*
  Test fixtures and mocks to prepare (for implementors):
  - Movie instances using the real constructor from src/app/models/movie.model.ts
  - PlannedMovieSession instances using the PlannedMovieSession constructor
  - Fake Store object with selectSignal stub returning an Angular Signal of PlannedMovieSession[]
  - Fake MatDialogRef and MAT_DIALOG_DATA to inject the MovieCtxtMenuModel
*/

// shared movie instance for tests
function movieInstance(){
  return factories.defaultMovie()
} 

function differentMovie(){
  return factories.someMovie() 
}

//// Sessions
// four planned sessions for the shared movie (different theaters/days/times)
//  -> two of them at the same day, different times.
// plus another one for an unrelated movie in the middle
const builder = factories.sessionBuilder().for({movie: movieInstance()})
builder.add({day: Days.FRIDAY})
      .add({day: Days.WEDNESDAY, startTime: Times.fromString('09h00')})
      .add({movie: differentMovie()}) // unrelated movie session
      .add({day: Days.WEDNESDAY, startTime: Times.fromString('14h00')})
      .add({day: Days.SUNDAY})

const sessions = builder.done() as PlannedMovieSession[]

// note: otherSession is added, but for a different movie: it is not expected to appear in the rendered list.
// There is a test for that somewhere.
const [fridaySession, wednesdayMorningSession, otherSession, wednesdayAfternoonSession, sundaySession] = sessions

const anchorMock = {
  location: {
    right: 200,
    left: 10,
    top: 20,
    bottom: 400
  }
} as any
