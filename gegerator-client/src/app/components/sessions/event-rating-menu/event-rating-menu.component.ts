import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { EventRating, EventRatings } from 'src/app/models/plannable.model';
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
  selector: 'app-event-rating-menu',
  templateUrl: './event-rating-menu.component.html',
  styleUrls: ['./event-rating-menu.component.scss']
})
export class EventRatingMenu implements OnInit, AfterViewInit {


  /**
   * The Component where this dialog should be attached
   * (see ngAfterViewInit())
   */
  public _anchor: SwimlaneItemComponent


  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  MovieRatings = MovieRatings
  EventRatings = EventRatings

  /**
   * Model
   */
  movieRating: MovieRating
  sessionRating: EventRating

  constructor(
    public dialogRef: MatDialogRef<EventRatingMenu>,
    @Inject(MAT_DIALOG_DATA) model: RatingsDialogModel) {
      this.movieRating = model.movieRating
      this.sessionRating = model.sessionRating
      this._anchor = model.anchor
    }

  ngOnInit(): void {
  }

  // Repositions the RatingDialog either immediately if needed 
  // to ensure that the menu can be rendered in full, ie wont 
  // be clipped by the bottom or right side of the viewport.
  ngAfterViewInit(): void {
    /*
    const myDims = this._container.nativeElement.getBoundingClientRect()
    const anchorDims= this._anchor.dimensions

    let ntop=0, nleft = 0
    // if the menu fits in the window, position it to the right of 
    // the anchor, or to the left if it overflows on y axis
    if (anchorDims.right + myDims.width < window.innerWidth){
      nleft = anchorDims.right
    }
    else{
      nleft = anchorDims.left - myDims.width - (2*DIALOG_PADDING_PX)
    }

    // same logic for the top attribute
    if (anchorDims.top + myDims.height < window.innerHeight){
      ntop = anchorDims.top
    }
    else{
      ntop = anchorDims.bottom - myDims.height - (2*DIALOG_PADDING_PX)
    }

    const newPos: DialogPosition = {
      top: `${ntop}px`, 
      left: `${nleft}px`
    } 

    this.dialogRef.updatePosition(newPos)
    */
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
  sessionRating: EventRating
}