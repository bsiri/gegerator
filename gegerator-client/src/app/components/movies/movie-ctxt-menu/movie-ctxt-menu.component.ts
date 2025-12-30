import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';


/**
 * Menu that allow to select ratings for movies.
 * 
 * As a secondary function, it also displays links to 
 * all sessions that plan that movie.
 * 
 * Because it only closes by 'onBlur', the result should be 
 * read straight from the MatDialogRef.componentInstance
 */
@Component({
    selector: 'app-movie-ctxt-menu',
    templateUrl: './movie-ctxt-menu.component.html',
    styleUrls: ['./movie-ctxt-menu.component.scss'],
    standalone: false
})
export class MovieCtxtMenu implements OnInit {

  public _anchor: ContextMenuRecipient

  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  MovieRatings = MovieRatings

  /**
   * Model
   */
  movie : Movie

  sessions$ = this.store.select(selectPlannedMovieSession).pipe(
    map(sessions => sessions.filter(s => s.movie.id == this.movie.id))
  )
  
  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<MovieCtxtMenu>,
    @Inject(MAT_DIALOG_DATA) model: MovieCtxtMenuModel) {
    this.movie = model.movie
    this._anchor = model.anchor
  }

  ngOnInit(): void {
  }


  updateMovieRating($event: MatRadioChange): void {
    this.movie.rating = $event.value
  }


}


export interface MovieCtxtMenuModel{
  anchor: ContextMenuRecipient
  movie : Movie
}