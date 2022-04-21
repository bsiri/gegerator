import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-uploaddialog',
  templateUrl: './uploaddialog.component.html',
  styleUrls: ['./uploaddialog.component.scss']
})
export class UploadDialog implements OnInit {

  file!: File

  constructor(public dialogRef: MatDialogRef<UploadDialog>){ 
  }

  ngOnInit(): void {
  }

  confirm(){
    this.dialogRef.close(this.file)
  }

  cancel(){
    this.dialogRef.close()
  }

}
