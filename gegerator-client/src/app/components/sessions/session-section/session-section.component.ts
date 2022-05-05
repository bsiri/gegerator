import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { OtherActivity } from 'src/app/models/activity.model';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { MovieSession, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectUserRoadmap } from 'src/app/ngrx/selectors/roadmap.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';
import { Activitydialog } from '../activitydialog/activitydialog.component';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';

@Component({
  selector: 'app-session-section',
  templateUrl: './session-section.component.html',
  styleUrls: ['./session-section.component.scss']
})
export class SessionSectionComponent implements OnInit, OnDestroy {


  /*
    "Importing" Days and Theaters as properties of this Component
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
  roadmap = this.store.select(selectUserRoadmap)

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void{

  }

  sessionsByDayAndTheater(day: Day, theater: Theater) : Observable<PlannedMovieSession[]>{
    return this.sessions$.pipe(
      map(sessions => sessions.filter(s => s.day == day && s.theater == theater))
    )
  }

  activitiesByDay(day: Day) : Observable<OtherActivity[]>{
    return this.activities$.pipe(
      map(activities => activities.filter(a => a.day == day))
    )
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
        const movieSession = new MovieSession(
          newsession.id,
          newsession.movie.id,
          newsession.theater,
          newsession.day,
          newsession.startTime,
          MovieSessionRatings.DEFAULT
        )
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
