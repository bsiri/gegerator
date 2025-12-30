import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Subscription } from 'rxjs';
import { Movie, MovieRating} from 'src/app/models/movie.model';
import { EventRating} from 'src/app/models/plannable.model';
import { Days } from 'src/app/models/referential.data';
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { selectActiveRoadmap, selectUserRoadmap } from 'src/app/ngrx/selectors/roadmap.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';

// A couple of interface
// Think of them as entries of a Map<Rating, Ratable[]>, 
// I found it clearer to explicitly model an interface for this
interface MoviesForRating {
  rating: MovieRating;
  movies: Movie[]
}

interface SessionsForRating{
  rating: EventRating,
  sessions: PlannedMovieSession[]
}


// ** main component **

@Component({
    selector: 'app-summarypanel',
    templateUrl: './summarypanel.component.html',
    styleUrls: ['./summarypanel.component.scss'],
    standalone: false
})
export class SummarypanelComponent implements OnInit, OnDestroy {

  // same thing as always : bring the Days in 'this' context
  // so we can use them in the template.
  Days = Days

  movies$ = this.store.select(selectMovieslist)

  events$ = combineLatest([
    this.store.select(selectPlannedMovieSession),
    this.store.select(selectActivitieslist)
  ]).pipe(
    map(([sessions, activities]) => [...sessions, ...activities])
  )

  roadmap: FestivalRoadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
  roadmapSub!: Subscription

  constructor(private store: Store) {
    this.roadmapSub = this.store.select(selectActiveRoadmap).subscribe(rmap => this.roadmap = rmap)
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.roadmapSub.unsubscribe()
  }

  isInRoadmap(movie: Movie): boolean{
    return this.roadmap.isInRoadmap(movie)
  }

  getSession(movie: Movie) : PlannedMovieSession | undefined{
    return this.roadmap.maybeGetSessionForMovie(movie)
  }

}
