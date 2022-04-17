import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, Observable, startWith } from 'rxjs';
import { Movie } from 'src/app/models/movie';
import { Days, Theaters } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { Times } from 'src/app/models/time.utils';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';

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

      this.id = session.id

      const title = session.movie?.title 
      const strStartTime = Times.toString(session.startTime)

      this.formGroup = new FormGroup({
        day: new FormControl(session.day, [Validators.required]),
        theater: new FormControl(session.theater, [Validators.required]),
        title: new FormControl(title, [
          Validators.required, this.validateMovie.bind(this)
        ]),
        startTime: new FormControl(strStartTime, [
          Validators.required, this.validateTime 
        ])
      })


      // adding the filter logic for the autocomplete on movies
      // see : https://material.angular.io/components/autocomplete/overview#adding-a-custom-filter
      this.filteredTitles = this.formGroup.get('title')!.valueChanges.pipe(
        startWith(''),
        map(value => {
          const movieTitles = this.availableMovies.map(m=>m.title)
          return movieTitles.filter(title=> title.includes(value))
        })
      )
  }

  ngOnInit(): void {
  }

  confirm(): void{
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
      startTime
    )
  }

  _getFGValue(fgName: string): any{
    return this.formGroup.get(fgName)!.value
  }

}
