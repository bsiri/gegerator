import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Movie, MovieRating } from 'src/app/models/movie.model';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Durations } from 'src/app/models/time.utils';
import { NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

const durEx: RegExp = RegExp(/^(\d)h([0-5]\d)$/);

@Component({
    selector: 'app-newmoviedialog',
    templateUrl: './moviedialog.component.html',
    styleUrls: ['./moviedialog.component.scss'],
    imports: [NgIf, MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatError, MatLabel, MatDialogActions, MatButton]
})
export class MovieDialog implements OnInit {

  // note: the following attributes are never modified by this form,
  // however we must remember it because enventually
  // we will need to re-emit a Movie with
  // updated data on it
  id: number;
  rating: MovieRating;
  formGroup: UntypedFormGroup;

  // mode == 'create' or 'update' depending on whether the MAT_DIALOG_DATA
  // is an existing instance of a Movie, or a shim for a new Movie.
  mode: string;

  constructor(
    public dialogRef: MatDialogRef<MovieDialog>,
    @Inject(MAT_DIALOG_DATA) movie: Movie
  ) {
    this.mode = (movie.id === undefined) ? 'create' : 'update'
    this.id = movie.id;
    this.rating = movie.rating;
    this.formGroup = new UntypedFormGroup({
      title: new UntypedFormControl(movie.title, [
        Validators.required
      ]),
      duration: new UntypedFormControl(Durations.toString(movie.duration), [
        Validators.required,
        validateDuration
      ])
    });
  }

  ngOnInit(): void {
  }

  toMovie(): Movie{
    return new Movie(
      this.id,
      this.formGroup.get('title')!.value,
      Durations.fromString(this.formGroup.get('duration')!.value),
      this.rating
    )
  }

  confirm(): void{
    if (this.formGroup.invalid){
      return;
    }
    const movie = this.toMovie();
    this.dialogRef.close(movie);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // ******** in-template validation helpers *******

  invalid(ctrName: string): boolean{
    const control = this.formGroup.get(ctrName)!;
    return control.invalid && (control.dirty || control.touched)
  }

}


function validateDuration(durControl: AbstractControl): ValidationErrors | null{
  try{
    Durations.fromString(durControl.value)
    return null;
  }
  catch (wtf){
    // return the exception as per contract
    return wtf as ValidationErrors;
  }
}

