import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SwimlaneItemComponent } from '../swimlane-item/swimlane-item.component';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent{

  @Input() session!: PlannedMovieSession

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
