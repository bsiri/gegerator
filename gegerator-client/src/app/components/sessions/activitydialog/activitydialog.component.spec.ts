import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Activitydialog } from './activitydialog.component';
import { Days } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { OtherActivity } from 'src/app/models/activity.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatFormFieldModule } from '@angular/material/form-field';
import { harnessHelper  } from 'src/_testhelpers/harnesshelper';
import { By } from '@angular/platform-browser';

// ********* Renreder template behavior test ************ //

describe('ActivityDialog-Template', async() => {
  let fixture: ComponentFixture<Activitydialog>
  let component: Activitydialog
  let dialogRef: MatDialogRef<Activitydialog>
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
        useValue: sampleActivity(1)
      },{
        provide: MatDialog,
        useValue: {}
      }]
    })
    fixture = TestBed.createComponent(Activitydialog);
    loader = TestbedHarnessEnvironment.loader(fixture);
    dialogRef = TestBed.inject(MatDialogRef);
    component = fixture.componentInstance;

  })

  it('should open in edit mode when supplied an existing activity', async () => {
    /*
      Goal of the test: check that the form dialog is prefilled with the
      supplied activity model info.

      Synopsis:
      - given : an activity object
      - when  : the dialog opens (implicitly done by TestBed.createComponent)
      - then  : the form fields are filled with the activity data.

      Desired checks in order:
      1. displayed description matches activity.description
      2. the day is the same
      3. displayed start time matches activity.startTime
      4. displayed end time matches activity.endTime
    */

    const expectedActivity = sampleActivity(1)

    await fixture.whenStable();
    const helper = harnessHelper(loader)

    // 1) description displayed
    const descriptionInput = await helper.text("oad-description input")
    expect(await descriptionInput.getValue()).toBe(expectedActivity.description)

    // 2) day selected
    const daySelector = await helper.select("oad-day mat-select")
    expect(await daySelector.getValueText()).toBe(expectedActivity.day.name)

    // 3) start time displayed
    const startInput = await helper.text("oad-starttime input")
    expect(await startInput.getValue()).toBe(Times.toString(expectedActivity.startTime))

    // 4) end time displayed
    const endInput = await helper.text("oad-endtime input")
    expect(await endInput.getValue()).toBe(Times.toString(expectedActivity.endTime))
  })

  it('should update the activity configuration', async ()=>{
    await fixture.whenStable();
    const helper = harnessHelper(loader)

    // update the Day (slow)
    const daySelector = await helper.select("oad-day mat-select")
    await daySelector.open()
    const optFriday = (await daySelector.getOptions({text: Days.FRIDAY.name}))[0]
    await optFriday.click()

    // update the description
    const descriptionInput = await helper.text("oad-description input")
    await descriptionInput.setValue('Today is pizza day!')

    // update the starttime
    const startInput = await helper.text("oad-starttime input")
    await startInput.setValue("12h00")

    // update the endtime
    const endInput = await helper.text("oad-endtime input")
    await endInput.setValue("13h30")

    // submit
    const submitButton = await helper.button("oad-submit")
    await submitButton.click()

    await fixture.whenStable()

    // assertions
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled();
    const closedArg = viClose.mock.calls[0][0];
    expect(closedArg).toHaveProperty('description', 'Today is pizza day!');
    expect(closedArg).toHaveProperty('day', Days.FRIDAY)
    expect(closedArg).toHaveProperty('startTime', Times.fromString("12h00"))
    expect(closedArg).toHaveProperty('endTime', Times.fromString("13h30"))

  });

  it('should close and do nothing', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)

    // change the description
    const descriptionInput = await helper.text("oad-description input")
    await descriptionInput.setValue('changed the description')
    
    // cancel
    const cancelButton = await helper.button('oad-cancel')
    await cancelButton.click()

    await fixture.whenStable()

    // assert the dialog closed without changing anything
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeUndefined()

  })

  it('should submit on enter', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    const endInput = await helper.text('oad-endtime input')
    const endInputHost = await endInput.host()

    await endInputHost.dispatchEvent('keyup', {key: "Enter"})
    await fixture.whenStable()
    
    // assert that the dialog closes and returns 
    // an instance (ie not undefined)
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeTruthy()
  });

  it('should says when data are invalid and refuse to submit', async ()=> {
    await fixture.whenStable();
    const helper = harnessHelper(loader)
    
    // First input bogus data
    // bogus description
    const descriptionInput = await helper.text("oad-description input")
    await descriptionInput.setValue('') // blank

    // bogus starttime
    const startInput = await helper.text("oad-starttime input")
    await startInput.setValue("at noon") // malformed time format

    // bogus endtime
    const endInput = await helper.text("oad-endtime input")
    await endInput.setValue("03h00") // this one is out of PLANNABLE_EVENT_TIME_INTERVAL

    // (try to) submit
    const submitButton = await helper.button("oad-submit")
    await submitButton.click()
    await fixture.whenStable()
    
    // Assert that the dialog has not submitted
    const viClose = (dialogRef.close) as Mock
    expect(viClose).not.toHaveBeenCalled()

    // Assert that the button is disabled anyway
    expect(await submitButton.isDisabled()).toBe(true)

    // Assert that all the from control are invalid
    const descField = await helper.formfield('oad-description')
    const startField = await helper.formfield('oad-starttime')
    const endField = await helper.formfield('oad-endtime')

    expect(await descField.isControlValid(), "description here is blank").toBe(false)
    expect(await startField.isControlValid(), "start time here is malformed").toBe(false)
    expect(await endField.isControlValid(), "end time here is outside of allowed range").toBe(false)
  })

  it('should display the time paradox error when start time is after end time', async () => {
    await fixture.whenStable();
    const helper = harnessHelper(loader)
    // this sucks but we have to select the native element, 
    // the harness is useless here
    const timeparadoxError = fixture.debugElement.query(
      By.css('.testid-oad-errtimeparadox')
    )
    // initially that message is hidden
    expect(timeparadoxError.styles['visibility']).toBe('hidden')
    

    // insert a time paradox
    const startInput = await helper.text("oad-starttime input")
    const endInput = await helper.text("oad-endtime input")

    await startInput.setValue("13h00") 
    await endInput.setValue("12h00") 

    // give focus to another field
    const descInput = await helper.text('oad-description input')
    await descInput.focus()
    await fixture.whenStable()

    // Assert that the message at the bottom is now visibl"

    // initially that message is hidden
    expect(timeparadoxError.styles['visibility']).toBe('visible')

  })

})

// ********** Component behavior test ********* //

describe('Activitydialog-Component', async () => {
  let dialogRefStub: any;
  let component: Activitydialog;

  beforeEach(() => {
    dialogRefStub = { close: vi.fn() };
    const inj = Injector.create({
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: sampleActivity(1) }
      ]
    })
    component = runInInjectionContext(inj, () => new Activitydialog());
  });


  it('should instantiate and set create mode when id is undefined', async () => {
    const inj = Injector.create({
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: sampleActivity(undefined) }
      ]
    })
    component = runInInjectionContext(inj, () => new Activitydialog());
    expect(component).toBeTruthy();
    expect(component.mode).toBe('create');
  });

  it('confirm() should close dialog with an OtherActivity when form is valid', async () => {
    // form is initialized with valid values in constructor
    component.confirm();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const closedArg = dialogRefStub.close.mock.calls[0][0];
    expect(closedArg).toHaveProperty('id', 1);
    expect(closedArg).toHaveProperty('description', 'a test activity');
  });

  it('cancel() should close dialog without args', async () => {
    component.cancel();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const args = dialogRefStub.close.mock.calls[0];
    expect(args.length).toBe(0);
  });

  it('validateTime() returns error for invalid string', async () => {
    const fakeCtrl: any = { value: 'invalid-time' };
    const res = component.validateTime(fakeCtrl as any);
    expect(res).not.toBeNull();
  });

});


// ************ Helper functions *************** //

function sampleActivity(id?: number): OtherActivity {
  return ({
    id,
    day: Days.WEDNESDAY,
    startTime: Times.fromString('9h00'),
    endTime: Times.fromString('10h00'),
    description: 'a test activity'
    // note: the Rating is configured elsewhere, wont be 
    // tested in this testsuite
  } as unknown) as OtherActivity;
}


