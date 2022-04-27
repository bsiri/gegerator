import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';
import { RatingDialog } from '../ratingdialog/ratingdialog.component';
import { SwimlaneItemComponent } from '../swimlane-item/swimlane-item.component';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent{

  @Input() session!: PlannedMovieSession

  @ViewChild(SwimlaneItemComponent) private _swlitem!: SwimlaneItemComponent 

  constructor(private store: Store, private dialog: MatDialog) {
  }


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
      const session = updatedSessionData.toMovieSession()
      this.store.dispatch(SessionActions.update_session({session}))
    })
  }

  // Update the Ratings for the Movie and for the Session
  openRatingsMenu(){
    // Note : the position will be either left of right of 
    // this component, the choice will ultimately be 
    // that of the RatingDialog.
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
        const session = plannedSession.copy({rating: newSessionRating})
                                      .toMovieSession()
        this.store.dispatch(SessionActions.update_session({session}))
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

