import { Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieSession, MovieSessionRating, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';
import { RatingDialog } from '../ratingdialog/ratingdialog.component';
import { SwimlaneItemComponent, SwItemBorderRendering, SwItemContentRendering } from '../swimlane-item/swimlane-item.component';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { FestivalRoadmap } from 'src/app/models/roadmap.model';


@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent{

  @Input() session!: PlannedMovieSession

  @Input() roadmap!: FestivalRoadmap

  @ViewChild(SwimlaneItemComponent) private _swlitem!: SwimlaneItemComponent 

  constructor(private store: Store, private dialog: MatDialog) {
  }


  // *********** content & border styles **************

  get contentRendering(): SwItemContentRendering{
    if (this._isDisabled()){
      return "disabled"
    }
    return movieRatingClasses.get(this.session.movie.rating) ?? "normal"
  }

  get borderRendering(): SwItemBorderRendering{
    if (this._isDisabled()){
      return "disabled"
    }
    return sessionRatingClasses.get(this.session.rating) ?? "normal"
  }

  _isDisabled(): boolean{
    const [movie, session, roadmap] = [this.session.movie, this.session, this.roadmap]

    // R1. If one of the ratings is 'NEVER', the session is disabled.
    if (movie.rating == MovieRatings.NEVER || session.rating == MovieSessionRatings.NEVER){
      return true
    }
    // R2. If the movie is already planned in a different session, this session is disabled.
    if (roadmap.isInRoadmap(movie) && ! this.roadmap.isInRoadmap(session)){
      return true
    }
    return false
  }

  // *********** data update ******************

  // Update the PlannedMovieSession
  update(){
    const dialogRef = this.dialog.open(SessionDialog, {
      autoFocus: 'first-tabbable',
      data: this.session.copy()
    })

    dialogRef.afterClosed().subscribe(updatedSessionData =>{
      if (! updatedSessionData){
        return 
      }

      const thenReload = this.session.checkChangesRequireReload(updatedSessionData)

      const session = updatedSessionData.toMovieSession()
      this.store.dispatch(SessionActions.update_session({session, thenReload}))
    })
  }

  // Update the Ratings for the Movie and for the Session
  openRatingsMenu(){
    const dialogRef = this.dialog.open(RatingDialog, {
      data: {
        anchor: this._swlitem,
        movieRating: this.session.movie.rating,
        sessionRating: this.session.rating
      },
      backdropClass: 'rating-nobackdrop',
      position: {
        top: "0px",
        left: "0px"
      }
    })

    // Reading the result straight from the dialog content
    // (remember that this dialog is blur only, so the API doesn't
    // allow to set a result).
    // Then update the movie/session rating if changed.
    dialogRef.afterClosed().subscribe((whatever) =>{
      const content = dialogRef.componentInstance
      const [newMovieRating, newSessionRating] = [content.movieRating, content.sessionRating]

      const plannedSession = this.session
      if (plannedSession.rating != newSessionRating){
        const modified = plannedSession.copy({rating: newSessionRating})
        
        const thenReload = this.session.checkChangesRequireReload(modified)

        const session = modified.toMovieSession()
        this.store.dispatch(SessionActions.update_session({session, thenReload}))
      }
      
      const movie = this.session.movie
      if (movie.rating !== newMovieRating){
        const modifiedMovie = movie.copy({rating: newMovieRating})
        this.store.dispatch(MovieActions.update_movie({movie: modifiedMovie}))
      }

    })
  }

  // Open the confirmation dialog, then delete this 
  // PlannedMovieSession if confirmed
  confirmThenDelete(){
    const dialogRef = this.dialog.open(GenericPurposeDialog, {
      data: {
        html: `Vraiment supprimer cette session ?`,
        type: "confirm"
      }
    });

    dialogRef.afterClosed().subscribe(response =>{
      if (response == ConfirmOutput.CONFIRM){
        const session: MovieSession = this.session.toMovieSession()
        this.store.dispatch(SessionActions.delete_session({session}))  
      }
    })
  }
}

// ******** css mapping ***********

const movieRatingClasses = new Map<MovieRating, SwItemContentRendering>(
  [
    [MovieRatings.HIGHEST, "very-green"],
    [MovieRatings.HIGH, "green"],
    [MovieRatings.DEFAULT, "normal"],
    [MovieRatings.NEVER, "disabled"]    
  ]
)

const sessionRatingClasses = new Map<MovieSessionRating, SwItemBorderRendering>(
  [
    [MovieSessionRatings.MANDATORY, "salient"],
    [MovieSessionRatings.DEFAULT, "normal"],
    [MovieSessionRatings.NEVER, "disabled"]    
  ]
)