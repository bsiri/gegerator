import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-uploaddialog',
  templateUrl: './uploaddialog.component.html',
  styleUrls: ['./uploaddialog.component.scss']
})
export class UploadDialog implements OnInit {

  file: File | null = null
  

  constructor(public dialogRef: MatDialogRef<UploadDialog>){ 
  }

  ngOnInit(): void {
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
