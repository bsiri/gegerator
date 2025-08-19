import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatestAll, combineLatestWith, map, Observable, Subscription, takeWhile } from 'rxjs';
import { combineLatestInit } from 'rxjs/internal/observable/combineLatest';
import { OtherActivity } from 'src/app/models/activity.model';
import { EventRatings } from 'src/app/models/plannable.model';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { FestivalRoadmap } from 'src/app/models/roadmap.model';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { Mode } from 'src/app/ngrx/appstate-models/mode.model';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectActiveRoadmap, selectUserRoadmap, selectWizardRoadmap } from 'src/app/ngrx/selectors/roadmap.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';
import { ModeService } from 'src/app/services/mode.service';
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

  /*
    Note: here we subscribe directly and assign the roadmap by subscription
    It is so because we need to inject it in each and every PlannedMovieSession.
    Doing so with an observable would lead to as many subscription wich would
    be very short lived.

    So we subscribe here once instead.
  */
  mode$! : Observable<Mode>
  roadmap!: FestivalRoadmap
  subRoadmap: Subscription


  constructor(private store: Store, private modeService: ModeService, private dialog: MatDialog) {
    this.mode$ = this.modeService.mode$
    this.subRoadmap = this.store.select(selectActiveRoadmap).subscribe(rm => this.roadmap = rm)
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void{
    this.subRoadmap.unsubscribe()
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
        /*
          if a MovieSession model has been created:
          - create it
          - then reopen a new dialog for chain creation

          Note to myself: calling again "openNewSession" in this block of code
          is actually not a recursive call, because this is within a callback handler
          and does not run in the same scope as the enclosing "openNewSession" execution.
        */
        const movieSession = new MovieSession(
          newsession.id,
          newsession.movie.id,
          newsession.theater,
          newsession.day,
          newsession.startTime,
          EventRatings.DEFAULT
        )
        this.store.dispatch(SessionActions.create_session({session: movieSession}))
        this.openNewSession(newsession.day, newsession.theater)
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
