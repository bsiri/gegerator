import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';
import { Movie } from '../../models/movie';
import { MovieDialog } from '../moviedialog/moviedialog.component';

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
    const _clone = { ...this.movie}
    const dialogRef = this.dialog.open(MovieDialog, {
      width: '350px',
      autoFocus: "first-tabbable",
      data: _clone
    });   

    dialogRef.afterClosed().subscribe(updated =>{
      if (!!updated){
        this.store.dispatch(MovieActions.update_movie({movie: updated}));
      }
    })
  }

}
