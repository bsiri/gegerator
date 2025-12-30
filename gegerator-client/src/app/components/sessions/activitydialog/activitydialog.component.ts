import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { OtherActivity } from 'src/app/models/activity.model';
import { Days } from 'src/app/models/referential.data';
import { Times } from 'src/app/models/time.utils';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-activitydialog',
    templateUrl: './activitydialog.component.html',
    styleUrls: ['./activitydialog.component.scss'],
    imports: [NgIf, MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatSelect, NgFor, MatOption, MatInput, MatLabel, MatError, NgStyle, MatDialogActions, MatButton]
})
export class Activitydialog implements OnInit {

  // note: the ID is never modified by this form,
  // however we must remember it because enventually
  // we will need to re-emit a Session with
  // updated data on it
  id: number;
  formGroup!: UntypedFormGroup;
  sessionDayBoundaries = SESSION_DAY_BOUNDARIES

  // mode == 'create' or 'update' depending on whether the MAT_DIALOG_DATA
  // is an existing instance of an Activity, or a shim for a new Activity.
  mode: string;

  // Form referential data
  Days = Days

  constructor(
    public dialogRef: MatDialogRef<Activitydialog>,
    @Inject(MAT_DIALOG_DATA) activity: OtherActivity
  ) {
    this.mode = (activity.id === undefined) ? 'create' : 'update'
    this.id = activity.id

    const strStartTime = Times.toString(activity.startTime)
    const strEndTime = Times.toString(activity.endTime)

    this.formGroup = new UntypedFormGroup({
      day: new UntypedFormControl(activity.day, [Validators.required]),
      description: new UntypedFormControl(activity.description, [Validators.required]),
      startTime: new UntypedFormControl(strStartTime, [
        Validators.required, this.validateTime
      ]),
      endTime: new UntypedFormControl(strEndTime, [
        Validators.required, this.validateTime
      ])
    })

    this.formGroup.addValidators(this.validatePeriod.bind(this))

  }

  ngOnInit(): void {
  }

  confirm(): void{
    if (this.formGroup.invalid){
      return;
    }
    const activity = this.toOtherActivity();
    this.dialogRef.close(activity);
  }

  cancel(): void{
    this.dialogRef.close()
  }


  validateTime(startTimeControl: AbstractControl): ValidationErrors | null{
    try{
      const rawValue = startTimeControl.value
      const time = Times.fromString(rawValue)
      if (! SESSION_DAY_BOUNDARIES.isInRange(time)){
        throw { value: rawValue }
      }
      return null;
    }
    catch(wtf){
      // contract says to return the errors
      return wtf as ValidationErrors
    }
  }

  validatePeriod(controls: AbstractControl): ValidationErrors | null{
      try{
        const invalidStart = this.validateTime(controls.get('startTime')!)
        const invalidEnd = this.validateTime(controls.get('endTime')!)

        // no point in checking the validity of the period if
        // one of them is already incorrect
        if (invalidStart || invalidEnd){
          return null
        }

        const [strStart, strEnd] = [this._getFGValue('startTime'), this._getFGValue('endTime')]
        const start = Times.fromString(strStart)
        const end = Times.fromString(strEnd)

        if (! Times.isBefore(start, end)){
          throw {'invalid_period' : `${strStart} - ${strEnd}`}
        }

        return null
      }
      catch(wtf){
        return wtf as ValidationErrors
      }
  }

  invalid(ctrName: string): boolean{
    const control = this.formGroup.get(ctrName)!;
    return control.invalid && (control.dirty || control.touched)
  }


  toOtherActivity(): OtherActivity{
    const [day, description, strStartTime, strEndTime] =
      ['day', 'description', 'startTime', 'endTime'].map(field => this._getFGValue(field))
    return new OtherActivity(
      this.id,
      day,
      Times.fromString(strStartTime),
      Times.fromString(strEndTime),
      description
    )
  }

  _getFGValue(fgName: string): any{
    return this.formGroup.get(fgName)!.value
  }

}
