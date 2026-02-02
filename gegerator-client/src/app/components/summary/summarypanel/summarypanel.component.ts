import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Movie } from 'src/app/models/movie.model';
import { Days } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { selectActivities } from 'src/app/ngrx/selectors/activity.selectors';
import { selectMovies } from 'src/app/ngrx/selectors/movie.selectors';
import { selectPlannedMovieSessions } from 'src/app/ngrx/selectors/session.selectors';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { NgTemplateOutlet } from '@angular/common';
import { EventLinkComponent } from '../../small-comps/event-link/event-link.component';
import { MovieRatingsComponent } from '../../small-comps/movie-ratings/movie-ratings.component';
import { SessionRatingsComponent } from '../../small-comps/session-ratings/session-ratings.component';
import { OrderByComparablePipe } from '../../../pipes/order-by-comparable.pipe';
import { OtherActivity } from 'src/app/models/activity.model';
import { RoadmapStore } from 'src/app/ngrx/stores/roadmap.store';


// ** main component **

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-summarypanel',
    templateUrl: './summarypanel.component.html',
    styleUrls: ['./summarypanel.component.scss'],
    imports: [MatTabGroup, MatTab, EventLinkComponent, MovieRatingsComponent, NgTemplateOutlet, SessionRatingsComponent, OrderByComparablePipe]
})
export class SummarypanelComponent {
  private store = inject(Store);


  // same thing as always : bring the Days in 'this' context
  // so we can use them in the template.
  Days = Days

  // Model data
  $movies: Signal<readonly Movie[]>
  $events: Signal<(OtherActivity | PlannedMovieSession)[]>

  $roadmap = inject(RoadmapStore).$activeRoadmap

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.$movies = this.store.selectSignal(selectMovies)

    const sessionStoreSignal = this.store.selectSignal(selectPlannedMovieSessions)
    const activitiesStoreSignal = this.store.selectSignal(selectActivities)
    this.$events = computed(() => {
      const latestSessions = sessionStoreSignal()
      const latestActivities = activitiesStoreSignal()
      return [... latestSessions, ... latestActivities]
    })
  }

  isInRoadmap(movie: Movie): boolean{
    return this.$roadmap().isInRoadmap(movie)
  }

  getSession(movie: Movie) : PlannedMovieSession | undefined{
    return this.$roadmap().maybeGetSessionForMovie(movie)
  }

}
