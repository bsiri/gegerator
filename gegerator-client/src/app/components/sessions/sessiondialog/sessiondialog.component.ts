import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, Observable, startWith } from 'rxjs';
import { Movie } from 'src/app/models/movie';
import { Days, Theaters } from 'src/app/models/referential.data';
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


  // Form referential data
  Days = Days
  Theaters = Theaters  
  availableMovies: ReadonlyArray<Movie> = []  
  filteredTitles: Observable<string[]>


  constructor(
    public dialogRef: MatDialogRef<SessionDialog>,
    @Inject(MAT_DIALOG_DATA) session: PlannedMovieSession,
    private store: Store
  ) { 

      this.store.select(selectMovieslist).subscribe(movies => this.availableMovies = movies)

      this.id = session.id
      this.formGroup = new FormGroup({
        day: new FormControl(session.day, [Validators.required]),
        theater: new FormControl(session.theater, [Validators.required]),
        title: new FormControl(session.movie?.title ?? '', [
          Validators.required, this.validateMovie.bind(this)])
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


  // ********* validation *************

  private _findMovieByTitle(title:string): Movie | undefined{
    return this.availableMovies.find(m=>m.title == title)    
  }

  validateMovie(movControl: AbstractControl): ValidationErrors | null{
    const putativeTitle = movControl.value
    const movie = this._findMovieByTitle(putativeTitle)
    if (! movie){
      return new Error(`unknown movie: ${putativeTitle}`)
    }
    else{
      return null;
    }
  }

  invalid(ctrName: string): boolean{
    const control = this.formGroup.get(ctrName)!
    return control.invalid && (control.dirty || control.touched)
  }

}
