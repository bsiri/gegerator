import { Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';

@Component({
  selector: 'app-session-section',
  templateUrl: './session-section.component.html',
  styleUrls: ['./session-section.component.scss']
})
export class SessionSectionComponent implements OnInit {


  /*
    Redeclaring Days and Theaters as properties of this Component
    allow for using them in the template.
  */
  Days = Days
  Theaters = Theaters

  /*
    A session row height
  */
  rowHeightInPixel: string = ''+SESSION_DAY_BOUNDARIES.sessionDayInPixel()+'px'
  

  /*
    The proper model now
  */
  sessions$ = this.store.select(selectPlannedMovieSession)

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void { 
    this.store.dispatch(SessionActions.reload_sessions());
  }

  sessionsByDayAndTheater(day: Day, theater: Theater) : PlannedMovieSession[]{
    let filteredSessions = [] as PlannedMovieSession[]
    this.sessions$.subscribe( allSessions =>
      filteredSessions = allSessions.filter(s => s.day == day && s.theater == theater)
    )
    return filteredSessions;
  }

  openNewSession(day: Day, theater: Theater): void{
    const dialogRef = this.dialog.open(SessionDialog, {
      autoFocus: 'first-tabbable',
      data: {
        id: undefined, 
        movie: undefined,
        theater: theater,
        day: day,
        startTime: undefined
      }
    })
  }
}
