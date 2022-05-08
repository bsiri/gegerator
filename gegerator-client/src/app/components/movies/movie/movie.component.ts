import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';
import { Movie } from '../../../models/movie.model';
import { GenericPurposeDialog, ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component';
import { MovieRatingMenu } from '../movie-rating-menu/movie-rating-menu.component';
import { MovieDialog } from '../moviedialog/moviedialog.component';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss']
})
export class MovieComponent implements OnInit, ContextMenuRecipient {

  @ViewChild('_container') private _container!: ElementRef

  @Input() movie!: Movie;

  public get location(): DOMRect {
    return this._container.nativeElement.getBoundingClientRect()
  }


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

  updateRating(){
    const dialogRef = this.dialog.open(MovieRatingMenu, {
      data: {
        anchor: this,
        movieRating: this.movie.rating,
      },
      backdropClass: 'rating-nobackdrop'
    })

    // Reading the result straight from the dialog content
    // (remember that this dialog is blur only, so the API doesn't
    // allow to set a result).
    // Then update the movie rating if changed.
    dialogRef.afterClosed().subscribe((whatever) =>{
      const newMovieRating= dialogRef.componentInstance.movieRating

      if (this.movie.rating !== newMovieRating){
        const modifiedMovie = this.movie.copy({rating: newMovieRating})
        this.store.dispatch(MovieActions.update_movie({movie: modifiedMovie}))
      }
    })    

    // kill the original event
    return false
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



