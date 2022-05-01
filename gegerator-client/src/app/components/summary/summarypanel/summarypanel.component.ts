import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { MovieSessionRating, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
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
    map(movies => {
      const byRating = mapMoviesByRating(movies)
      return Array.from(byRating.entries()).map(entry => {
        return {rating: entry[0], movies: entry[1]} as MoviesForRating
      })
    }),
  )

  sessionsForRatings = 
    this.store.select(selectPlannedMovieSession).pipe(
    map(sessions => {
      const byRating = mapSessionByRating(sessions)
      return Array.from(byRating.entries()).map(entry => {
        return {rating: entry[0], sessions: entry[1]} as SessionsForRating
      })
    })
  )
  
  activities = this.store.select(selectActivitieslist)

  constructor(private store: Store) {

  }

  ngOnInit(): void {
  }

}

// ************ util functions ***********


type Rating = MovieSessionRating | MovieRating
type Ratable<R extends Rating> = {
  rating: R
}


function mapMoviesByRating(movies: readonly Movie[]): Map<MovieRating, Movie[]>{
  return _mapByRating(movies, MovieRatings.enumerate())
}

function mapSessionByRating(sessions: readonly PlannedMovieSession[]): Map<MovieSessionRating, PlannedMovieSession[]>{
  return _mapByRating(sessions, MovieSessionRatings.enumerate())
}

function _mapByRating<R extends Rating, T extends Ratable<R>>
          (ratables: readonly T[], 
            // Sorry, I need to supply the array of all ratings
            // because, long story short, poor modelling.
            allRatings: readonly R[] ): Map<R, T[]>{
  
  const byRatings = new Map<R, T[]>(
    allRatings.map(rating => [rating, []])
  )
  ratables.forEach(rat => byRatings.get(rat.rating)?.push(rat))
  return byRatings
}
