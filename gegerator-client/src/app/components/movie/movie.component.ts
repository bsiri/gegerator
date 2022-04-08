import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Movie } from '../../models/movie';
import { CreateUpdateMovieDialog } from '../newmoviedialog/newmoviedialog.component';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss']
})
export class MovieComponent implements OnInit {

  @Input() movie!: Movie;

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  updateMovie(): void{
    const dialogRef = this.dialog.open(CreateUpdateMovieDialog, {
      width: '350px',
      autoFocus: "first-tabbable",
      data: { id: undefined, title: '', duration: undefined }
    });   
  }

}
