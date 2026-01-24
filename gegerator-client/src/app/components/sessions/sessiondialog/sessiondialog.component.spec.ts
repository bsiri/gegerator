import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'

import { SessionDialog } from './sessiondialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { harnessHelper } from 'src/_testhelpers/harnesshelper';
import { Store } from '@ngrx/store';
import { Days, Theaters } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { Movie } from 'src/app/models/movie.model';
import { signal, Signal } from '@angular/core';


describe('SessionDialog - Template', async () => {
  let fixture: ComponentFixture<SessionDialog>
  let component: SessionDialog
  let dialogRef: MatDialogRef<SessionDialog>
  let loader: HarnessLoader

  const movies = sampleMovies()

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule, MatButtonModule],
      providers: [{
        provide: MatDialogRef,
        useValue: {
          close: vi.fn()
        }
      },{
        provide: MAT_DIALOG_DATA,
        useValue: sampleSession(1)
      },{
        provide: Store,
        useValue: {
          selectSignal: (_: any) => signal(sampleMovies())
        }
      }]
    })
    fixture = TestBed.createComponent(SessionDialog);
    loader = TestbedHarnessEnvironment.loader(fixture);
    dialogRef = TestBed.inject(MatDialogRef);
    component = fixture.componentInstance;
  })

  it('should open in edit mode when supplied an existing session', async () => {
    /*
      Goal of the test : check that the form dialog is prefilled with the 
      supplied session model info.

      Synopsis:
      - given : a session object
      - when : the dialog opens (implicitly done by TestBed.createComponent)
      - then: the form fields are filled with the session data.

      Desired tests and assertions:
      1. displayed movie title is same as the session->movie in the model,
      2. the day is the same,
      3. displayed start time is the same,
      4. the theater is the same.
      In that order.
    */

    const expectedSession = sampleSession(1)

    // Wait for initial rendering
    await fixture.whenStable();
    const helper = harnessHelper(loader)

    // 1) movie title displayed
    const titleInput = await helper.text('sd-title input')
    expect(await titleInput.getValue()).toBe(expectedSession.movie.title)

    // 2) day selected
    const daySelector = await helper.select('sd-day mat-select')
    expect(await daySelector.getValueText()).toBe(expectedSession.day.name)

    // 3) start time displayed
    const startInput = await helper.text('sd-starttime input')
    expect(await startInput.getValue()).toBe(Times.toString(expectedSession.startTime))

    // 4) theater selected
    const theaterSelector = await helper.select('sd-theater mat-select')
    expect(await theaterSelector.getValueText()).toBe(expectedSession.theater.name)
  })

  it('should submit edited session (happy path)', async () => {
    const expectedSelectedMovie = movies[1]
    await fixture.whenStable();
    const helper = harnessHelper(loader)


    // update the start time
    const startInput = await helper.text('sd-starttime input')
    await startInput.setValue('12h00')

    // fill title (using autocomplete) with a known movie
    const titleInput = await helper.text('sd-title input')
    await titleInput.focus()
    await fixture.whenStable()
    const autocomplete = await helper.autocomplete()
    const movieOption = (await autocomplete.getOptions({text: expectedSelectedMovie.title}))[0]
    await movieOption.click()

    // update day (slow)
    const daySelector = await helper.select('sd-day mat-select')
    await daySelector.open()
    const optFriday = (await daySelector.getOptions({text: Days.FRIDAY.name}))[0]
    await optFriday.click()

    // update theater
    const theaterSelector = await helper.select('sd-theater mat-select')
    await theaterSelector.open()
    const opt = (await theaterSelector.getOptions({text: Theaters.CASINO.name}))[0]
    await opt.click()

    // submit
    const submitButton = await helper.button('sd-submit')
    await submitButton.click()

    await fixture.whenStable()

    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    const closedArg = viClose.mock.calls[0][0]

    expect(closedArg).toHaveProperty('movie')
    expect(closedArg.movie.title).toBe(expectedSelectedMovie.title)
    expect(closedArg).toHaveProperty('startTime', Times.fromString('12h00'))
    expect(closedArg).toHaveProperty('day', Days.FRIDAY)
    expect(closedArg).toHaveProperty('theater', Theaters.CASINO)
  })

  it('should close and do nothing on cancel', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)

    const titleInput = await helper.text('sd-title input')
    await titleInput.setValue('changed title')

    const cancelButton = await helper.button('sd-cancel')
    await cancelButton.click()

    await fixture.whenStable()

    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeUndefined()
  })

  it('should submit on enter keypress', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    const startInput = await helper.text('sd-starttime input')
    const host = await startInput.host()

    await host.dispatchEvent('keyup', {key: 'Enter'})
    await fixture.whenStable()

    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeTruthy()
  })

  it('should refuse to submit and display the errors when there are any', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    
    // let input bogus data
    const titleInput = await helper.text('sd-title input')
    await titleInput.setValue('An Unknown Movie')

    const starttimeInput = await helper.text('sd-starttime input')
    await starttimeInput.setValue('invalid time')

    // now attempt to submit
    const submitButton = await helper.button('sd-submit')
    await submitButton.click()
    await fixture.whenStable()

    // expect the nope answer
    const viClose = (dialogRef.close) as Mock
    expect(viClose).not.toHaveBeenCalled()
    expect(await submitButton.isDisabled()).toBe(true)

    // assert that the control fields for title and startime are invalid
    const titleField = await helper.formfield('sd-title')
    const titleError = (await titleField.getErrors())[0]
    const starttimeField = await helper.formfield('sd-starttime')

    expect(await titleField.isControlValid()).toBe(false)
    expect(await titleError.getText()).toMatch(/Je le connais pas.*/i)
    expect(await starttimeField.isControlValid()).toBe(false)

  })

})


describe('SessionDialog - Component', async () => {
  let dialogRefStub: any;
  const movies = sampleMovies()
  const mockStore = { selectSignal: (_: any) => (() => movies) } as unknown as Store<any>

  beforeEach(() => {
    dialogRefStub = { close: vi.fn() };
  });

  it('should instantiate and set create mode when id is undefined', async () => {
    const comp = new SessionDialog(dialogRefStub as any, sampleSession(undefined), mockStore as any)
    expect(comp).toBeTruthy()
    expect(comp.mode).toBe('create')
  })

  it('confirm() should close dialog with a PlannedMovieSession when form is valid', async () => {
    const comp = new SessionDialog(dialogRefStub as any, sampleSession(1), mockStore as any)
    comp.formGroup.get('title')!.setValue(movies[0].title)
    comp.formGroup.get('startTime')!.setValue('10h00')
    comp.formGroup.get('day')!.setValue(Days.WEDNESDAY)
    comp.formGroup.get('theater')!.setValue(Theaters.CASINO)

    comp.confirm()
    expect(dialogRefStub.close).toHaveBeenCalled()
    const closedArg = dialogRefStub.close.mock.calls[0][0]
    expect(closedArg).toHaveProperty('movie')
    expect(closedArg.movie.title).toBe(movies[0].title)
  })

  it('cancel() should close dialog without args', async () => {
    const comp = new SessionDialog(dialogRefStub as any, sampleSession(2), mockStore as any)
    comp.cancel()
    expect(dialogRefStub.close).toHaveBeenCalled()
    const args = dialogRefStub.close.mock.calls[0]
    expect(args.length).toBe(0)
  })

  it('validateTime() returns error for invalid string', async () => {
    const comp = new SessionDialog(dialogRefStub as any, sampleSession(3), mockStore as any)
    const fakeCtrl: any = { value: 'invalid-time' }
    const res = comp.validateTime(fakeCtrl as any)
    expect(res).not.toBeNull()
  })

})


// ************ Helper factories and mocks *************** //

function sampleSession(id?: number): PlannedMovieSession {
  const movies = sampleMovies()
  return new PlannedMovieSession(
    id as any,
    movies[0],
    Theaters.ESPACE_LAC,
    Days.WEDNESDAY,
    Times.fromString('9h00')
  )
}

function sampleMovies(): Movie[] {
  return [
    new Movie(1, 'Alpha Movie', { hours: 1, minutes: 45 } as any),
    new Movie(2, 'Known Movie', { hours: 2, minutes: 0 } as any),
    new Movie(3, 'Another Film', { hours: 1, minutes: 30 } as any)
  ]
}
