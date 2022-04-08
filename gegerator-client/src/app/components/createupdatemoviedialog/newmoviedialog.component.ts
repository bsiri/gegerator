import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie } from 'src/app/models/movie';
import { Duration } from "iso8601-duration";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

const durEx: RegExp = RegExp(/^(\d)h([0-5]\d)$/);

@Component({
  selector: 'app-newmoviedialog',
  templateUrl: './newmoviedialog.component.html',
  styleUrls: ['./newmoviedialog.component.scss']
})
export class CreateUpdateMovieDialog implements OnInit {

  // note: the ID is never modified by this form, 
  // however we must remember it because enventually
  // we will need to re-emit a Movie with 
  // updated data on it
  id: number;
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateUpdateMovieDialog>,
    @Inject(MAT_DIALOG_DATA) movie: Movie
  ) { 
    this.id = movie.id;
    this.formGroup = new FormGroup({
      title: new FormControl(movie.title, [
        Validators.required
      ]),
      duration: new FormControl(strFromDuration(movie.duration), [
        Validators.required,
        validateDuration
      ])
    });
  }

  ngOnInit(): void {
  }

  toMovie(): Movie{
    return {
      id: this.id,
      title: this.formGroup.get('title')!.value,
      duration: durationFromStr(this.formGroup.get('duration')!.value)
    }
  }

  confirm(): void{
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
    durationFromStr(durControl.value)
    return null;
  }
  catch (wtf){
    // return the exception as per contract
    return wtf as ValidationErrors;
  }
}


function strFromDuration(duration: Duration): string{
  return (duration) ? `${duration.hours}:${duration.minutes}` : ''
}


function durationFromStr(strDuration: string) : Duration{
  const match = strDuration.trim().match(durEx)
  if (! match){
    throw { duration: strDuration} as ValidationErrors;
  }
  const [hours, minutes] = match.slice(1).map(i => parseInt(i));
  return {hours, minutes};
}
