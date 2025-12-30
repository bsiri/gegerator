import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, Observable, startWith } from 'rxjs';
import { Movie } from 'src/app/models/movie.model';
import { EventRating } from 'src/app/models/plannable.model';
import { Days, Theaters } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { Times } from 'src/app/models/time.utils';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-sessiondialog',
    templateUrl: './sessiondialog.component.html',
    styleUrls: ['./sessiondialog.component.scss'],
    imports: [NgIf, MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatAutocomplete, NgFor, MatOption, MatFormField, MatInput, MatAutocompleteTrigger, MatError, MatLabel, MatSelect, MatDialogActions, MatButton, AsyncPipe]
})
export class SessionDialog implements OnInit {

  // note: these attributes are never modified by this form,
  // however we must remember it because enventually
  // we will need to re-emit a Session with
  // updated data on it
  id: number;
  rating: EventRating
  formGroup!: UntypedFormGroup;

  // mode == 'create' or 'update' depending on whether the MAT_DIALOG_DATA
  // is an existing instance of a MovieSession, or a shim for a new MovieSession
  mode: string;

  // Form referential data
  Days = Days
  Theaters = Theaters
  availableMovies: ReadonlyArray<Movie> = []
  filteredTitles: Observable<string[]>
  sessionDayBoundaries = SESSION_DAY_BOUNDARIES

  constructor(
    public dialogRef: MatDialogRef<SessionDialog>,
    @Inject(MAT_DIALOG_DATA) session: PlannedMovieSession,
    private store: Store
  ) {

      this.store.select(selectMovieslist).subscribe(movies => this.availableMovies = movies)

      this.mode = (session.id === undefined) ? 'create' : 'update'
      this.id = session.id
      this.rating = session.rating

      const title = session.movie?.title
      const strStartTime = Times.toString(session.startTime)

      this.formGroup = new UntypedFormGroup({
        day: new UntypedFormControl(session.day, [Validators.required]),
        theater: new UntypedFormControl(session.theater, [Validators.required]),
        title: new UntypedFormControl(title, [
          Validators.required, this.validateMovie.bind(this)
        ]),
        startTime: new UntypedFormControl(strStartTime, [
          Validators.required, this.validateTime
        ])
      })


      // adding the filter logic for the autocomplete on movies
      // see : https://material.angular.io/components/autocomplete/overview#adding-a-custom-filter
      this.filteredTitles = this.formGroup.get('title')!.valueChanges.pipe(
        startWith(''),
        map(value => {
          const movieTitles = this.availableMovies.map(m=>m.title)
          return movieTitles.filter(title=> title.toLowerCase().includes(value.toLowerCase()))
        })
      )
  }

  ngOnInit(): void {
  }

  @HostListener('window:keyup.Enter', ['$event'])
  confirm(): void{
    if (this.formGroup.invalid){
      return;
    }
    const session = this.toPlannedMovieSession();
    this.dialogRef.close(session);
  }

  cancel(): void{
    this.dialogRef.close()
  }

  // ********* validation *************

  private _findMovieByTitle(title:string): Movie | undefined{
    return this.availableMovies.find(m=>m.title == title)
  }

  validateMovie(movControl: AbstractControl): ValidationErrors | null{
    const candidateTitle = movControl.value
    const movie = this._findMovieByTitle(candidateTitle)
    if (! movie){
      return { 'unknown_movie': candidateTitle} as ValidationErrors
    }
    else{
      return null;
    }
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

  invalid(ctrName: string): boolean{
    const control = this.formGroup.get(ctrName)!
    return control.invalid && (control.dirty || control.touched)
  }


  toPlannedMovieSession(): PlannedMovieSession{
    const title = this._getFGValue('title')
    const day = this._getFGValue('day')
    const theater = this._getFGValue('theater')
    const strStartTime = this._getFGValue('startTime')

    // Note about the '!' : the movie cannot be undefined
    // here because the dialog already validated it.
    const movie = this._findMovieByTitle(title)!
    const startTime = Times.fromString(strStartTime)

    return new PlannedMovieSession(
      this.id,
      movie,
      theater,
      day,
      startTime,
      this.rating
    )
  }

  _getFGValue(fgName: string): any{
    return this.formGroup.get(fgName)!.value
  }

}
