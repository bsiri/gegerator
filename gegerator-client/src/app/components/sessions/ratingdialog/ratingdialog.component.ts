import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlannedMovieSession } from 'src/app/models/session.model';

@Component({
  selector: 'app-ratingdialog',
  templateUrl: './ratingdialog.component.html',
  styleUrls: ['./ratingdialog.component.scss']
})
export class RatingDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RatingDialog>,
    @Inject(MAT_DIALOG_DATA) session: PlannedMovieSession) { }

  ngOnInit(): void {
  }

}
