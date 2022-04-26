import { AfterContentInit, AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { SwimlaneItemComponent } from '../swimlane-item/swimlane-item.component';

@Component({
  selector: 'app-ratingdialog',
  templateUrl: './ratingdialog.component.html',
  styleUrls: ['./ratingdialog.component.scss']
})
export class RatingDialog implements OnInit, AfterViewInit {

  /**
   * DOM references for rendering
   */
  @ViewChild('rtdialContainer') private _container!: ElementRef
  private _parent: SwimlaneItemComponent


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
    @Inject(MAT_DIALOG_DATA) ratings: RatingsDialogModel) { 
      this.movieRating = ratings.movieRating
      this.sessionRating = ratings.sessionRating
      
      this._parent = ratings.parentComponent

    }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myDims = this._container.nativeElement.getBoundingClientRect()
    const parentDims= this._parent.dimensions

    if (myDims.right > window.innerWidth){
      const left = parentDims.left - myDims.width - 48
      const newPos: DialogPosition = {
        top: `${parentDims.top}px`, 
        left: `${left}px`
      } 
      this.dialogRef.updatePosition(newPos)
    }
  }

}

export interface RatingsDialogModel{
  parentComponent: SwimlaneItemComponent
  movieRating: MovieRating
  sessionRating: MovieSessionRatings
}