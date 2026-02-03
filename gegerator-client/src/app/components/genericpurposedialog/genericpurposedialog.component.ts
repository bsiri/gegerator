import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';


export enum ConfirmOutput{
  CONFIRM,
  CANCEL
}

export interface ConfirmDialogData{
  message: string;
  html: string;
  type: "confirm" | "info" | "error"
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-confirmdialog',
    templateUrl: './genericpurposedialog.component.html',
    styleUrls: ['./genericpurposedialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatIcon, MatDialogActions, MatButton]
})
export class GenericPurposeDialog {
  dialogRef = inject<MatDialogRef<GenericPurposeDialog>>(MatDialogRef);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  content: string;
  type: string;

  constructor() {
    const data = this.data;
 
    // TODO : actually if a message is supplied instead of html,
    // at least we should html-encode it before usage.
    this.content = data.message || data.html || "Confirmer ?"
    this.type = data.type || "confirm"
  }

  confirm(): void{
    this.dialogRef.close(ConfirmOutput.CONFIRM);
  }

  cancel(): void{
    this.dialogRef.close(ConfirmOutput.CANCEL);
  }

}
