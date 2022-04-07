import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie } from 'src/app/models/movie';


@Component({
  selector: 'app-newmoviedialog',
  templateUrl: './newmoviedialog.component.html',
  styleUrls: ['./newmoviedialog.component.scss']
})
export class NewMovieDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NewMovieDialog>,
    @Inject(MAT_DIALOG_DATA) public movie: Movie
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
