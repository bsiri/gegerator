import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { MovieSessionRating, MovieSessionRatings } from 'src/app/models/session.model';
import { SwimlaneItemComponent } from '../swimlane-item/swimlane-item.component';

// magic number to account for the Dialog padding
const DIALOG_PADDING_PX = 24

/**
 * Dialog that allow to select ratings for movies and sessions.
 * 
 * Because it only closes by 'onBlur', the result should be 
 * read straight from the MatDialogRef.componentInstance
 */
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
  private _anchor: SwimlaneItemComponent


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
  sessionRating: MovieSessionRating

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

  updateMovieRating($event: MatRadioChange): void{
    this.movieRating = $event.value
  }

  updateSessionRating($event: MatRadioChange): void{
    this.sessionRating = $event.value
  }

}

export interface RatingsDialogModel{
  anchor: SwimlaneItemComponent
  movieRating: MovieRating
  sessionRating: MovieSessionRating
}