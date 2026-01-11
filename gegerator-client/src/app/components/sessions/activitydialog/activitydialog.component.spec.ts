import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Activitydialog } from './activitydialog.component';
import { Days } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { OtherActivity } from 'src/app/models/activity.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {HarnessLoader} from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatFormFieldModule } from '@angular/material/form-field';
import { harnessHelper  } from 'src/_testhelpers/harnesshelper';

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

  it('should update the activity configuration', async ()=>{
    await fixture.whenStable();

    // update the Day
    const helper = harnessHelper(loader)
    const daySelector = await helper.select("oa-day mat-select")
    await daySelector.open()
    const optFriday = (await daySelector.getOptions({text: Days.FRIDAY.name}))[0]
    await optFriday.click()

    // update the description
    const descriptionInput = await helper.text("oa-description input")
    await descriptionInput.setValue('Today is pizza day!')

    // update the starttime
    const startInput = await helper.text("oa-starttime input")
    await startInput.setValue("12h00")

    // update the endtime
    const endInput = await helper.text("oa-endtime input")
    await endInput.setValue("13h30")

    // submit
    const submitButton = await helper.button("oa-submit")
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
    const cancelButton = await helper.button('oa-cancel')
    await cancelButton.click()
    await fixture.whenStable()

    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).toBeUndefined()

  })

  it('should submit on enter', async () => {
    await fixture.whenStable()
    const helper = harnessHelper(loader)
    const endInput = await helper.text('oa-endtime input')
    const endInputHost = await endInput.host()
    endInputHost.sendKeys('enter')
    // endInputHost.dispatchEvent('keyup.enter')
    await fixture.whenStable()
    
    // assert that the dialog closes and returns 
    // an instance (ie not undefined)
    const viClose = (dialogRef.close) as Mock
    expect(viClose).toHaveBeenCalled()
    expect(viClose.mock.calls[0][0]).not.toBeUndefined()


  });

})

// ********** Component behavior test ********* //

describe('Activitydialog-Component', async () => {
  let dialogRefStub: any;

  beforeEach(() => {
    dialogRefStub = { close: vi.fn() };
  });


  it('should instantiate and set create mode when id is undefined', async () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(undefined));
    expect(comp).toBeTruthy();
    expect(comp.mode).toBe('create');
  });

  it('confirm() should close dialog with an OtherActivity when form is valid', async () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(1));
    // form is initialized with valid values in constructor
    comp.confirm();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const closedArg = dialogRefStub.close.mock.calls[0][0];
    expect(closedArg).toHaveProperty('id', 1);
    expect(closedArg).toHaveProperty('description', 'a test activity');
  });

  it('cancel() should close dialog without args', async () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(2));
    comp.cancel();
    expect(dialogRefStub.close).toHaveBeenCalled();
    const args = dialogRefStub.close.mock.calls[0];
    expect(args.length).toBe(0);
  });

  it('validateTime() returns error for invalid string', async () => {
    const comp = new Activitydialog(dialogRefStub as any, sampleActivity(3));
    const fakeCtrl: any = { value: 'invalid-time' };
    const res = comp.validateTime(fakeCtrl as any);
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
  } as unknown) as OtherActivity;
}


