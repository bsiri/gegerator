import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { OtherActivity } from 'src/app/models/activity.model';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';
import { Activitydialog } from '../activitydialog/activitydialog.component';
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
  activities$ = this.store.select(selectActivitieslist)

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  sessionsByDayAndTheater(day: Day, theater: Theater) : PlannedMovieSession[]{
    let filteredSessions = [] as PlannedMovieSession[]
    this.sessions$.subscribe( allSessions =>
      filteredSessions = allSessions.filter(s => s.day == day && s.theater == theater)
    )
    return filteredSessions;
  }

  activitiesByDay(day: Day) : OtherActivity[]{
    let filteredActivities = [] as OtherActivity[]
    this.activities$.subscribe( allactivities =>
      filteredActivities = allactivities.filter(a => a.day == day)  
    )
    return filteredActivities
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

    dialogRef.afterClosed().subscribe(newsession => {
      if (!!newsession){
        const movieSession: MovieSession = {
          id: newsession.id,
          movieId: newsession.movie.id,
          theater: newsession.theater,
          day: newsession.day,
          startTime: newsession.startTime
        }
        this.store.dispatch(SessionActions.create_session({session: movieSession}))
      }
    })
  }

  openNewActivity(day: Day): void{
    const dialogRef = this.dialog.open(Activitydialog, {
      autoFocus: 'first-tabbable',
      data: {
        id: undefined, 
        day: day,
        startTime: undefined,
        endTime: undefined,
        description: ''
      }
    })

    dialogRef.afterClosed().subscribe(newactivity => {
      if (!!newactivity){
        const activity = new OtherActivity(
          newactivity.id, 
          newactivity.day,
          newactivity.startTime, 
          newactivity.endTime,
          newactivity.description
        )
        this.store.dispatch(ActivityActions.create_activity({activity}))
      }
    })  
  }
}
