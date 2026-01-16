import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-uploaddialog',
    templateUrl: './uploaddialog.component.html',
    styleUrls: ['./uploaddialog.component.scss'],
    imports: [MatDialogTitle, FormsModule, CdkScrollable, MatDialogContent, MatDialogActions, MatButton]
})
export class UploadDialog { 

  file: File | null = null
  
  constructor(public dialogRef: MatDialogRef<UploadDialog>){ 
  }

  changeFile(event: any) {
    const files: FileList = event.target.files
    if (files.length > 0){
      this.file = files[0]
    }
  }

  confirm(){
    this.dialogRef.close(this.file)
  }

  cancel(){
    this.dialogRef.close()
  }

}
