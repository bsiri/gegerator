import { Component, Inject, OnInit } from '@angular/core';
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
    selector: 'app-confirmdialog',
    templateUrl: './genericpurposedialog.component.html',
    styleUrls: ['./genericpurposedialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatIcon, MatDialogActions, MatButton]
})
export class GenericPurposeDialog implements OnInit {
  content: string;
  type: string;

  constructor(
    public dialogRef: MatDialogRef<GenericPurposeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { 
    // TODO : actually if a message is supplied instead of html,
    // at least we should html-encode it before usage.
    this.content = data.message || data.html || "Confirmer ?"
    this.type = data.type || "confirm"
  }

  ngOnInit(): void {
  }

  confirm(): void{
    this.dialogRef.close(ConfirmOutput.CONFIRM);
  }

  cancel(): void{
    this.dialogRef.close(ConfirmOutput.CANCEL);
  }

}
