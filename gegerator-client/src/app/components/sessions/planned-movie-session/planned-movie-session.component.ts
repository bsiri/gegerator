import { Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';
import { EventRatingMenu } from '../event-rating-menu/event-rating-menu.component';
import { SwimlaneItemComponent, SwItemBorderRendering, SwItemContentRendering } from '../swimlane-item/swimlane-item.component';
import { MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { EventRating, EventRatings } from 'src/app/models/plannable.model';


@Component({
    selector: 'app-planned-movie-session',
    templateUrl: './planned-movie-session.component.html',
    styleUrls: ['./planned-movie-session.component.scss'],
    standalone: false
})
export class PlannedMovieSessionComponent{

  @Input() session!: PlannedMovieSession

  @Input() roadmap!: FestivalRoadmap

  @ViewChild(SwimlaneItemComponent) private _swlitem!: SwimlaneItemComponent 

  constructor(private store: Store, private dialog: MatDialog) {
  }


  // *********** content & border styles **************

  get contentRendering(): SwItemContentRendering{
    if (this._isOutstanding()){
      return "outstanding"
    }
    if (this._isDisabled()){
      return "disabled"
    }
    return movieRatingClasses.get(this.session.movie.rating) ?? "normal"
  }

  get borderRendering(): SwItemBorderRendering{
    if (this._isOutstanding()){
      return "outstanding"
    }
    if (this._isDisabled()){
      return "disabled"
    }
    return sessionRatingClasses.get(this.session.rating) ?? "normal"
  }

  _isDisabled(): boolean{
    const [movie, session, roadmap] = [this.session.movie, this.session, this.roadmap]

    // R1. If one of the ratings is 'NEVER', the session is disabled
    if (movie.rating == MovieRatings.NEVER || session.rating == EventRatings.NEVER){
      return true
    }
    // R2. If the movie is already planned in a different session, this session is disabled.
    if (roadmap.isInRoadmap(movie) && ! this.roadmap.isInRoadmap(session)){
      return true
    }
    return false
  }

  _isOutstanding(): boolean{
    return (this.roadmap.isInRoadmap(this.session) && this.roadmap.author == RoadmapAuthor.MACHINE)
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

  // Update the Ratings for the Session
  updateRating(){
    const dialogRef = this.dialog.open(EventRatingMenu, {
      data: {
        anchor: this._swlitem,
        eventRating: this.session.rating
      },
      backdropClass: 'rating-nobackdrop'
    })

    // Reading the result straight from the dialog content
    // (remember that this dialog is blur only, so the API doesn't
    // allow to set a result).
    // Then update the event rating if changed.
    dialogRef.afterClosed().subscribe((whatever) =>{
      const newSessionRating = dialogRef.componentInstance.eventRating

      const plannedSession = this.session
      if (plannedSession.rating != newSessionRating){
        const modified = plannedSession.copy({rating: newSessionRating})
        
        const thenReload = this.session.checkChangesRequireReload(modified)

        const session = modified.toMovieSession()
        this.store.dispatch(SessionActions.update_session({session, thenReload}))
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

const sessionRatingClasses = new Map<EventRating, SwItemBorderRendering>(
  [
    [EventRatings.MANDATORY, "salient"],
    [EventRatings.DEFAULT, "normal"],
    [EventRatings.NEVER, "disabled"]    
  ]
)