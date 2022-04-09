import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export enum ConfirmOutput{
  CONFIRM,
  CANCEL
}

export interface ConfirmDialogData{
  message: string;
  type: "confirm" | "info" | "danger"
}

@Component({
  selector: 'app-confirmdialog',
  templateUrl: './confirmdialog.component.html',
  styleUrls: ['./confirmdialog.component.scss']
})
export class ConfirmDialog implements OnInit {
  message: string;
  type: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { 
    this.message = data.message || "Confirmer ?"
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
