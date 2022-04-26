import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';
import { RatingDialog } from '../ratingdialog/ratingdialog.component';
import { SwimlaneItemComponent } from '../swimlane-item/swimlane-item.component';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent{

  @Input() session!: PlannedMovieSession

  @ViewChild('_container') private _container!: ElementRef 

  constructor(private store: Store, private dialog: MatDialog) {
  }


  // Update the PlannedMovieSession
  update(){
    const _clone = { ...this.session} as PlannedMovieSession
    const dialogRef = this.dialog.open(SessionDialog, {
      autoFocus: 'first-tabbable',
      data: _clone
    })

    dialogRef.afterClosed().subscribe(updatedSessionData =>{
      if (! updatedSessionData){
        return 
      }
      const session = _toMovieSession(updatedSessionData)
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
        anchor: this,
        movieRating: this.session.movie.rating,
        sessionRating: this.session.rating
      },
      backdropClass: 'rating-nobackdrop',
      position: {
        top: "0px",
        left: "0px"
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
        const session = _toMovieSession(this.session)
        this.store.dispatch(SessionActions.delete_session({session}))  
      }
    })
  }


  // ********** other utility methods ****************
  
  /**
   * Exposes the dimensions of that Component
   */
  public get dimensions(): DOMRect{
    return this._container.nativeElement.getBoundingClientRect()
  }


}


function _toMovieSession(pms: PlannedMovieSession): MovieSession{
  const session = new MovieSession(
      pms.id, 
      pms.movie.id,
      pms.theater,
      pms.day,
      pms.startTime
  )
  return session
}

