import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie } from 'src/app/models/movie';
import { Duration } from "iso8601-duration";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

const durEx: RegExp = RegExp(/^(\d):(\d\d)$/);

@Component({
  selector: 'app-newmoviedialog',
  templateUrl: './newmoviedialog.component.html',
  styleUrls: ['./newmoviedialog.component.scss']
})
export class NewMovieDialog implements OnInit {

  // note: the ID is never modified by this form, 
  // however we must remember it because enventually
  // we will need to re-emit a Movie with 
  // updated data on it
  id: number;
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewMovieDialog>,
    @Inject(MAT_DIALOG_DATA) movie: Movie
  ) { 
    this.id = movie.id;
    this.formGroup = new FormGroup({
      title: new FormControl(movie.title, [
        Validators.required]
      ),
      duration: new FormControl(strFromDuration(movie.duration), [
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

  title(){
    return this.formGroup.get('title')!
  }

  duration(){
    return this.formGroup.get('duration')!
  }

}


function validateDuration(durControl: AbstractControl): ValidationErrors | null{
  const correct = durEx.test(durControl.value.trim());
  if (correct){
    return null;
  }
  else{
    return {duration: {value: durControl.value}}
  }
}

function strFromDuration(duration: Duration): string{
  return (duration) ? `${duration.hours}:${duration.minutes}` : ''
}

function durationFromStr(strDuration: string) : Duration{
  const match = strDuration.trim().match(durEx)
  if (! match){
    throw new Error(`wrong duration ${strDuration}`);
  }
  const [hours, minutes] = match.slice(1).map(i => parseInt(i));
  return {hours, minutes};
}
