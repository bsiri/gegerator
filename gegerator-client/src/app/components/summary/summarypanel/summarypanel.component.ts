import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { groupBy, map } from 'rxjs';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { PlannableItem } from 'src/app/models/plannable.model';
import { Day, Days } from 'src/app/models/referential.data';
import { MovieSession, MovieSessionRating, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { Times } from 'src/app/models/time.utils';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';


type Rating = MovieRating|MovieSessionRating
type Ratable = {rating: Rating}


@Component({
  selector: 'app-summarypanel',
  templateUrl: './summarypanel.component.html',
  styleUrls: ['./summarypanel.component.scss']
})
export class SummarypanelComponent implements OnInit {

  moviesByRating = this.store.select(selectMovieslist).pipe(
    map(movies => {
      const sorted = movies.slice()
                          .sort((m1, m2) => m1.title.toLowerCase().localeCompare(m2.title.toLowerCase()))
      return groupByRating(sorted)
    })
  )

  sessionsByRating = this.store.select(selectPlannedMovieSession).pipe(
    map(sessions => {
      const sorted = sessions.slice()
                            .filter(s => s.rating != MovieSessionRatings.DEFAULT)
                            .sort(byTime)
      return groupByRating(sorted)
    })
  )
  
  activities = this.store.select(selectActivitieslist).pipe(
    map(acties => acties.slice().sort(byTime))
  )

  constructor(private store: Store) {

  }

  ngOnInit(): void {
  }

}

// ************ util functions ***********

const _enumDays = Days.enumerate()

function /*sort*/byTime(item1: PlannableItem, item2: PlannableItem): number{
  const [day1, day2] = [item1.day, item2.day]
  if (day1 != day2){
    return _enumDays.indexOf(day1) - _enumDays.indexOf(day2)
  }
  return Times.compare(item1.startTime, item2.startTime)
}

function groupByRating<R extends Ratable>(ratables: R[]): Map<Rating, R[]>{
  const result = new Map<Rating, R[]>()
  ratables.forEach(r => {
    const rating = r.rating
    if (! result.get(rating)){
      result.set(rating, [])
    }
    result.get(rating)?.push(r) ?? [r]
  }) 
  return result
}