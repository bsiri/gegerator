import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatFormFieldModule } from '@angular/material/form-field';
import { harnessHelper  } from 'src/_testhelpers/harnesshelper';
import { By } from '@angular/platform-browser';
import { MovieDialog } from './moviedialog.component';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { Durations } from 'src/app/models/time.utils';
import { Mode } from 'src/app/ngrx/appstate-models/mode.model';


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

  beforeEach(() => {
    dialogRef = { close: vi.fn() }
  })

  it('should instantiate and set create mode when id is undefined', async () => {
    const comp = new MovieDialog(dialogRef as any, sampleMovie(undefined))
    expect(comp).toBeTruthy()
    expect(comp.mode).toBe("create")
  })
  
  it('should instantiate and set modification mode when id is set', async () => {
    const comp = new MovieDialog(dialogRef as any, sampleMovie(1))
    expect(comp).toBeTruthy()
    expect(comp.mode).toBe("update")
  })

  it('confirm() should close dialog with a valid Movie when form is valid', async () =>{
    const comp = new MovieDialog(dialogRef as any, sampleMovie(undefined))
    // emulate some changes
    comp.formGroup.get('title')?.setValue('Greated show on Earth!')
    comp.formGroup.get('duration')?.setValue('1h25')
    comp.confirm()

    expect(dialogRef.close).toHaveBeenCalled()
    const resultMovie = dialogRef.close.mock.calls[0][0]
    expect(resultMovie.title).toEqual("Greated show on Earth!")
    expect(resultMovie.duration).toEqual(Durations.fromString('1h25'))
  })

  it('close() should close the dialog and abort the creation of the movie', async () => {
    const comp = new MovieDialog(dialogRef as any, sampleMovie(undefined))
    comp.cancel()
    expect(dialogRef.close).toHaveBeenCalled()
    expect(dialogRef.close.mock.calls[0].length).toBe(0)
  })

})


// ************ Helper functions *************** //

function sampleMovie(id?: number): Movie {
  return ({
    id,
    title: "Worst movie ever :-(",
    duration: Durations.fromString("3h02")
    // note: the Rating is configured elsewhere, wont be 
    // tested in this test suite.
  } as unknown) as Movie
}
