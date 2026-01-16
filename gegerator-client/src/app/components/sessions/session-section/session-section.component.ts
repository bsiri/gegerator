import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { OtherActivity } from 'src/app/models/activity.model';
import { EventRatings } from 'src/app/models/plannable.model';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { FestivalRoadmap } from 'src/app/models/roadmap.model';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { SessionActions } from 'src/app/ngrx/actions/session.actions';
import { Mode } from 'src/app/ngrx/appstate-models/mode.model';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectActiveRoadmap } from 'src/app/ngrx/selectors/roadmap.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';
import { ModeService } from 'src/app/services/mode.service';
import { Activitydialog } from '../activitydialog/activitydialog.component';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';
import { SessionDialog } from '../sessiondialog/sessiondialog.component';
import { NgTemplateOutlet, NgStyle } from '@angular/common';
import { OtherActivityComponent } from '../other-activity/other-activity.component';
import { PlannedMovieSessionComponent } from '../planned-movie-session/planned-movie-session.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TimePipe } from '../../../pipes/time.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-session-section',
    templateUrl: './session-section.component.html',
    styleUrls: ['./session-section.component.scss'],
    imports: [NgTemplateOutlet, NgStyle, OtherActivityComponent, PlannedMovieSessionComponent, MatButton, MatIcon, TimePipe]
})
export class SessionSectionComponent {

  /*
    "Importing" Days, Theaters and SESSION_DAY_BOUNDARIES as properties of this Component
    allow for using them in the template.
  */
  Days = Days
  Theaters = Theaters
  SESSION_DAY_BOUNDARIES = SESSION_DAY_BOUNDARIES

  /*
    A session row height
  */
  rowHeightInPixel: string = ''+SESSION_DAY_BOUNDARIES.sessionDayInPixel()+'px'


  /*
    Data model
  */
  $sessions = this.store.selectSignal(selectPlannedMovieSession)
  $activities = this.store.selectSignal(selectActivitieslist)

  $mode: Signal<Mode>
  $roadmap: Signal<FestivalRoadmap>


  constructor(private store: Store, private modeService: ModeService, private dialog: MatDialog) {
    this.$mode = this.modeService.$mode
    this.$roadmap = this.store.selectSignal(selectActiveRoadmap)
  }

  sessionsByDayAndTheater(day: Day, theater: Theater) : PlannedMovieSession[]{
    return this.$sessions().filter(s => s.day == day && s.theater == theater)
  }

  activitiesByDay(day: Day): OtherActivity[]{
    return this.$activities().filter(a => a.day == day)
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
        this.openNewActivity(newactivity.day)
      }
    })
  }
}
