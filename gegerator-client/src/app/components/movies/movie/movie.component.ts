import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';
import { Movie } from '../../../models/movie.model';
import { GenericPurposeDialog, ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component';
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

    dialogRef.afterClosed().subscribe(updatedMovieData =>{
      if (!!updatedMovieData){
        this.store.dispatch(MovieActions.update_movie({movie: updatedMovieData}));
      }
    })
  }

  confirmThenDelete(): void{
    const dialogRef = this.dialog.open(GenericPurposeDialog, {
      data: {
        html: `Vraiment supprimer ce film : ${this.movie.title} ? <br/> Toutes les seances liées vont sauter aussi !`,
        type: "confirm"
      }
    });

    dialogRef.afterClosed().subscribe(response =>{
      if (response == ConfirmOutput.CONFIRM){
        this.store.dispatch(MovieActions.delete_movie({movie: this.movie}))
      } 
    });
  }

}



