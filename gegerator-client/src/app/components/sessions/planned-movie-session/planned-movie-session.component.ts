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

  @ViewChild(SwimlaneItemComponent) viewRef!: SwimlaneItemComponent 

  constructor(private store: Store, private dialog: MatDialog) {
  }

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


  openRatingsMenu(){
    const position = this.ratingsMenuPosition()
    const _clone = { ...this.session} as PlannedMovieSession
    const dialogRef = this.dialog.open(RatingDialog, {
      data: _clone,
      backdropClass: 'rating-nobackdrop',
      position: position
    })
  }


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
   * Compute the top and left offset for the 
   * RatingDialog
   */
  private ratingsMenuPosition(): DialogPosition{
    const viewDims = this.viewRef.dimensions
    const top = viewDims.top
    const left = viewDims.left + viewDims.width
    return {
      top: `${top}px`,
      left: `${left}px`
    }
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
