import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { PlannableItem } from 'src/app/models/plannable.model';
import { Day, Days } from 'src/app/models/referential.data';
import { MovieSession, MovieSessionRating, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { Times } from 'src/app/models/time.utils';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';

// A couple of interface
// Think of them as entries of a Map<Rating, Ratable[]>, 
// I found it clearer to explicitly model an interface for this
interface MoviesForRating {
  rating: MovieRating;
  movies: Movie[]
}

interface SessionsForRating{
  rating: MovieSessionRating,
  sessions: PlannedMovieSession[]
}


// ** main component **

@Component({
  selector: 'app-summarypanel',
  templateUrl: './summarypanel.component.html',
  styleUrls: ['./summarypanel.component.scss']
})
export class SummarypanelComponent implements OnInit {

  moviesForRatings = this.store.select(selectMovieslist).pipe(
    map(toMoviesByRatingList)
  )

  sessionsForRatings: Observable<SessionsForRating[]> = 
          this.store.select(selectPlannedMovieSession).pipe(
            map(toSessionsByRatingList)
  )
  
  activities = this.store.select(selectActivitieslist)

  constructor(private store: Store) {

  }

  ngOnInit(): void {
  }

}

// ************ util functions ***********

/** 
 * @returns a list of SessionForRating, sorted by rating.
 * 
 * Entries for MovieSessionRating.DEFAULT will be excluded.
 */
function toSessionsByRatingList(sessions: readonly PlannedMovieSession[]): SessionsForRating[]{
  const _copy = sessions.slice()
  const sessionsByRatings = new Map<MovieSessionRating, PlannedMovieSession[]>(
    MovieSessionRatings.enumerate().map(rating => [rating, []])
  )
  
  sessions.forEach(session => sessionsByRatings.get(session.rating)?.push(session))
  
  return Array.from(sessionsByRatings.entries()).map(entry => {
    return {
      rating: entry[0],
      sessions: entry[1]
    } as SessionsForRating
  })
  .filter(sfr => sfr.rating != MovieSessionRatings.DEFAULT)
  .sort((a, b) => MovieSessionRatings.compare(a.rating, b.rating))
}

/**
 * See toSessionsByRatingList, but here it is for movies.
 * Note that here we don't filter on any rating 
 * (unlike for, eg, MovieSessionRating.DEFAULT as above), 
 * here we want them all.
 * 
 * @param movies
 */
function toMoviesByRatingList(movies: readonly Movie[]) : MoviesForRating[]{
  const _copy = movies.slice()
  const moviesByRatings = new Map<MovieRating, Movie[]>(
    MovieRatings.enumerate().map(rating => [rating, []])
  )
  
  movies.forEach(movie => moviesByRatings.get(movie.rating)?.push(movie))
  
  return Array.from(moviesByRatings.entries()).map(entry => {
    return {
      rating: entry[0],
      movies: entry[1]
    } as MoviesForRating
  })
  .sort((a, b) => MovieSessionRatings.compare(a.rating, b.rating))
}