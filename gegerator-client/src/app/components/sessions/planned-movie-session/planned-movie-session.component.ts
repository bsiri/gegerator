import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent implements OnInit {

  @Input() session!: PlannedMovieSession
  
  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  constructor(private store: Store, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const {startTime, endTime} = this.session
    // must wait for 'session' to be set before computing dimensions
    this.heightInPixel = ''+SESSION_DAY_BOUNDARIES.durationInPixel(this.session.movie.duration)+'px' 
    this.topPosInPixel = ''+SESSION_DAY_BOUNDARIES.offsetFromDayBeginInPixel(this.session.startTime)+'px' 
  }

  updateSession(){
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
  const session: MovieSession = {
    id: pms.id, 
    movieId: pms.movie.id,
    theater: pms.theater,
    startTime: pms.startTime,
    day: pms.day
  }
  return session
}
