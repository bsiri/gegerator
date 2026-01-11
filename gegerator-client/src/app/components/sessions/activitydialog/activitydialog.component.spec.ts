import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Activitydialog } from './activitydialog.component';
import { Days } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { OtherActivity } from 'src/app/models/activity.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {By} from '@angular/platform-browser';
import {HarnessLoader} from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness} from '@angular/material/form-field/testing'
import { MatSelectModule } from '@angular/material/select'
import { MatSelectHarness, SelectHarnessFilters } from '@angular/material/select/testing';
import { assert } from 'node:console';
import { loaderHelper } from 'src/_testhelpers/harnesshelper';

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
    let rootElt = fixture.nativeElement as HTMLElement;
    const helper = loaderHelper(loader)

    // update the Day
    const daySelector = await helper.withSelect("oa-day")
    await daySelector.selectOption("oa-opt-"+Days.FRIDAY.key)

    // update the description
    const descInput = await helper.withTextField("oa-description")
    await descInput.setText("today is pizza day")

    // update the starttime
    const starttimeInput = await helper.withTextField("oa-starttime")
    await starttimeInput.setText("12h00")

    // update the endtime
    const endtimeInput = await helper.withTextField("oa-endtime")
    await endtimeInput.setText("13h30")


    await fixture.whenStable()

  })
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


