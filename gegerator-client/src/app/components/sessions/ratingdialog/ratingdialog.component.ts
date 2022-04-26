import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { PlannedMovieSessionComponent } from '../planned-movie-session/planned-movie-session.component';

const DIALOG_PADDING_PX = 24

@Component({
  selector: 'app-ratingdialog',
  templateUrl: './ratingdialog.component.html',
  styleUrls: ['./ratingdialog.component.scss']
})
export class RatingDialog implements OnInit, AfterViewInit {


  /**
   * The Component where this dialog should be attached
   * (see ngAfterViewInit())
   */
  private _anchor: PlannedMovieSessionComponent


  /**
   * DOM references for rendering
   */
  @ViewChild('_container') private _container!: ElementRef


  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  MovieRatings = MovieRatings
  MovieSessionRatings = MovieSessionRatings

  /**
   * Model
   */
  movieRating: MovieRating
  sessionRating: MovieSessionRatings

  constructor(
    public dialogRef: MatDialogRef<RatingDialog>,
    @Inject(MAT_DIALOG_DATA) model: RatingsDialogModel) {
      this.movieRating = model.movieRating
      this.sessionRating = model.sessionRating
      this._anchor = model.anchor
    }

  ngOnInit(): void {
  }

  // Repositions the RatingDialog either immediately to 
  // the right of the parent PlannedMovieSessionComponent
  // if possible, or to the left if the dialog would overflow
  // the screen.
  ngAfterViewInit(): void {
    const myDims = this._container.nativeElement.getBoundingClientRect()
    const anchorDims= this._anchor.dimensions

    let ntop=0, left = 0
    if (anchorDims.right + myDims.width < window.innerWidth){
      ntop = anchorDims.top
      left = anchorDims.right
    }
    else{
      ntop = anchorDims.top
      left = anchorDims.left - myDims.width - (2*DIALOG_PADDING_PX)
    }

    const newPos: DialogPosition = {
      top: `${ntop}px`, 
      left: `${left}px`
    } 

    this.dialogRef.updatePosition(newPos)
  }

}

export interface RatingsDialogModel{
  anchor: PlannedMovieSessionComponent
  movieRating: MovieRating
  sessionRating: MovieSessionRatings
}