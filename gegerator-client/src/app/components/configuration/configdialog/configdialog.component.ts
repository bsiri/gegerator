import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { Theaters } from 'src/app/models/referential.data';
import { TheaterRatings, WizardConfiguration } from 'src/app/ngrx/appstate-models/wizardconfiguration.model';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';

import { MatButton } from '@angular/material/button';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-configdialog',
    templateUrl: './configdialog.component.html',
    styleUrls: ['./configdialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatSelect, MatOption, MatSlider, MatSliderThumb, MatDialogActions, MatButton]
})
export class ConfigDialog  {
  dialogRef = inject<MatDialogRef<ConfigDialog>>(MatDialogRef);


  Theaters = Theaters
  TheaterRatings = TheaterRatings
  
  formGroup: UntypedFormGroup
  movieVsTheaterBias: number

  constructor() {
    const wizconf = inject<WizardConfiguration>(MAT_DIALOG_DATA);

    this.formGroup = new UntypedFormGroup({
      espaceLacRating: new UntypedFormControl(wizconf.espaceLacRating),
      casinoRating: new UntypedFormControl(wizconf.casinoRating),
      paradisoRating: new UntypedFormControl(wizconf.paradisoRating),
      mclRating: new UntypedFormControl(wizconf.mclRating)
    })
    // mat-slider doesn't work with formgroups, so we 
    // manage the bias outside of it
    this.movieVsTheaterBias = wizconf.movieVsTheaterBias
  }

  confirm(): void{
    const wizconf = this.toWizardConfiguration();
    this.dialogRef.close(wizconf);
  }

  cancel(): void{
    this.dialogRef.close()
  }

  toWizardConfiguration(): WizardConfiguration{
    return new WizardConfiguration(
      this._getFGValue('espaceLacRating'),
      this._getFGValue('casinoRating'),
      this._getFGValue('paradisoRating'),
      this._getFGValue('mclRating'),
      this.movieVsTheaterBias
    )
  }

  _getFGValue(fgName: string): any{
    return this.formGroup.get(fgName)!.value
  }

}
