import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Days } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';

@Component({
  selector: 'app-sessiondialog',
  templateUrl: './sessiondialog.component.html',
  styleUrls: ['./sessiondialog.component.scss']
})
export class SessionDialog implements OnInit {

  // note: the ID is never modified by this form, 
  // however we must remember it because enventually
  // we will need to re-emit a Session with 
  // updated data on it
  id: number;
  formGroup!: FormGroup;


  // Form model data
  Days = Days
  availableMovies = this.store.select(selectMovieslist)


  constructor(
    public dialogRef: MatDialogRef<SessionDialog>,
    @Inject(MAT_DIALOG_DATA) session: PlannedMovieSession,
    private store: Store
  ) { 
      this.id = session.id
      this.formGroup = new FormGroup({
        day: new FormControl(session.day)
      })
  }

  ngOnInit(): void {
  }

}
