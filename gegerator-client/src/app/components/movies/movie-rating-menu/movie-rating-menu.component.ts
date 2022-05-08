import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { EventRatingMenu } from '../../sessions/event-rating-menu/event-rating-menu.component';


/**
 * Menu that allow to select ratings for movies.
 * 
 * Because it only closes by 'onBlur', the result should be 
 * read straight from the MatDialogRef.componentInstance
 */
@Component({
  selector: 'app-movie-rating-menu',
  templateUrl: './movie-rating-menu.component.html',
  styleUrls: ['./movie-rating-menu.component.scss']
})
export class MovieRatingMenu implements OnInit {

  public _anchor: ContextMenuRecipient

  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  MovieRatings = MovieRatings

  /**
   * Model
   */
  movieRating: MovieRating

  constructor(
    public dialogRef: MatDialogRef<EventRatingMenu>,
    @Inject(MAT_DIALOG_DATA) model: MovieRatingMenuModel) {
      this.movieRating = model.movieRating
      this._anchor = model.anchor
    }

  ngOnInit(): void {
  }


  updateMovieRating($event: MatRadioChange): void{
    this.movieRating = $event.value
  }


}


export interface MovieRatingMenuModel{
  anchor: ContextMenuRecipient
  movieRating: MovieRating
}