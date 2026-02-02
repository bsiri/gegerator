import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatFormFieldModule } from '@angular/material/form-field';
import { harnessHelper  } from 'src/_testhelpers/harnesshelper';
import { MovieDialog } from './moviedialog.component';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { Durations } from 'src/app/models/time.utils';
import * as factories from 'src/_testhelpers/factories';


// ********* Renreder template behavior test ************ //

describe('MovieDialog-Template', async() => {
  let fixture: ComponentFixture<MovieDialog>
  let component: MovieDialog
  let dialogRef: MatDialogRef<MovieDialog>
  let loader: HarnessLoader

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatFormFieldModule],
      providers: [{
        provide: MatDialogRef,
        useValue: {
          close: vi.fn()
        }
      },{
        provide: MAT_DIALOG_DATA,
        useValue: sampleMovie(1)
      },{
        provide: MatDialog,
        useValue: {}
      }]
    })
    fixture = TestBed.createComponent(MovieDialog);
    loader = TestbedHarnessEnvironment.loader(fixture);
    dialogRef = TestBed.inject(MatDialogRef);
    component = fixture.componentInstance;
  })

  it('should open in edit mode when supplied an existing movie', async () => {
    /*
      Goal of the test: check that the form dialog is prefilled with the
      supplied movie model info.

      Synopsis:
      - given : a movie object
      - when  : the dialog opens (implicitly done by TestBed.createComponent)
      - then  : the form fields are filled with the movie data.

      Desired checks in order:
      1. displayed title matches movie.title
      2. displayed duration matches movie.duration
    */

    const expectedMovie = sampleMovie(1)

    await fixture.whenStable()
    const helper = harnessHelper(loader)

    // 1) title displayed
    const titleInput = await helper.text('md-title input')
    expect(await titleInput.getValue()).toBe(expectedMovie.title)

    // 2) duration displayed
    const durationInput = await helper.text('md-duration input')
    expect(await durationInput.getValue()).toBe(Durations.toString(expectedMovie.duration))
  })

  it('should replace the movie data', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)

    // Update the title
    const titleInput = await helper.text('md-title input')
    await titleInput.setValue('Greatest show on Earth!')

    // update the duration
    const durationInput = await helper.text('md-duration input')
    await durationInput.setValue('1h50')

    // submit
    const submitButton = await helper.button('md-submit')
    await submitButton.click()

    // Test that the dialog closed and returned the updated movie
    // as its argument
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()

    const movie = viClose.mock.calls[0][0]
    expect(movie.title).toBe("Greatest show on Earth!")
    expect(movie.duration).toEqual(Durations.fromString("1h50"))
  })

  it('should close and do nothing', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    
    // change the title
    const titleInput = await helper.text('md-title input')
    await titleInput.setValue('changed title')

    // then cancel
    const cancelButton = await helper.button('md-cancel')
    await cancelButton.click()

    // assert the dialog closed without changing anything
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeUndefined()
  })

  it('should submit on enter', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    const durationInput = await helper.text('md-duration input')
    await durationInput.setValue('1h35')

    const durationInputHost = await durationInput.host()
    await durationInputHost.dispatchEvent('keyup', {key: "Enter"})

    await fixture.whenStable()
    
    // assert that the dialog closes and returns 
    // an instance (ie not undefined)
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeTruthy()
  })

  it('should say when data are invalid and refuse to submit', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    // assert that the error message for 'title' is not initially visible
    try{
      await helper.error('md-title-error')
      expect(false, "the error for the title field should initially be not displayed").toBe(true)
    }catch(elementnotfound){
      // all clear, proceed
    }

    // set bogus data in all inputs then attempt to submit
    const titleInput = await helper.text('md-title input')
    await titleInput.setValue('')
    
    const durationInput = await helper.text('md-duration input')
    await durationInput.setValue('abcde')

    const submitButton = await helper.button('md-submit')
    await submitButton.click()

    // Assert that the dialog has not submitted
    const viClose = (dialogRef.close) as Mock
    expect(viClose).not.toHaveBeenCalled()
    
    // Assert that the submit button is disabled anyway
    expect(await submitButton.isDisabled()).toBe(true)

    // Assert that both formfields are in invalid state
    const titleField = await helper.formfield('md-title')
    const durationField = await helper.formfield('md-duration')

    expect(await titleField.isControlValid()).toBe(false)
    expect(await durationField.isControlValid()).toBe(false)

    // Assert the banter error message is displayed
    // Note: here we use mat-error as intended, so merely 
    // succeeding in selecting it is an indicator that 
    // it is present in the page in itself
    const titleError = await helper.error('md-title-error')

  })

})

// ********* Component behavior test *********** //

describe('MovieDalog-Component', async () => {
  let dialogRef: any
  let component: MovieDialog

  beforeEach(() => {
    dialogRef = { close: vi.fn() }
    const inj = Injector.create({ providers: [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: sampleMovie(undefined) }
    ] })
    component = runInInjectionContext(inj, () => new MovieDialog())

  })

  it('should instantiate and set create mode when id is undefined', async () => {
    // Note: beforeEach creates a movie with undefined id
    expect(component).toBeTruthy()
    expect(component.mode).toBe("create")
  })
  
  it('should instantiate and set modification mode when id is set', async () => {
    const inj = Injector.create({ providers: [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: sampleMovie(1) }
    ] })
    component = runInInjectionContext(inj, () => new MovieDialog())
    expect(component).toBeTruthy()
    expect(component.mode).toBe("update")
  })

  it('confirm() should close dialog with a valid Movie when form is valid', async () =>{
    // emulate some changes
    component.formGroup.get('title')?.setValue('Greated show on Earth!')
    component.formGroup.get('duration')?.setValue('1h25')
    component.confirm()

    expect(dialogRef.close).toHaveBeenCalled()
    const resultMovie = dialogRef.close.mock.calls[0][0]
    expect(resultMovie.title).toEqual("Greated show on Earth!")
    expect(resultMovie.duration).toEqual(Durations.fromString('1h25'))
  })

  it('close() should close the dialog and abort the creation of the movie', async () => {
    component.cancel()
    expect(dialogRef.close).toHaveBeenCalled()
    expect(dialogRef.close.mock.calls[0].length).toBe(0)
  })

})

// ********* Helper functions *********** //

function sampleMovie(id: number | undefined): Movie {
  if (id === undefined) {
    return ({
      id: undefined,
      title: 'New Movie',
      duration: Durations.fromString("1h30"),
      rating: MovieRatings.HIGH
    } as unknown) as Movie
  } else {
    return factories.defaultMovie({id})
  }
}
