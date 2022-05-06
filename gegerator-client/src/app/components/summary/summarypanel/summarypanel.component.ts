import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import { Movie, MovieRating, MovieRatings } from 'src/app/models/movie.model';
import { Days } from 'src/app/models/referential.data';
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model';
import { MovieSessionRating, MovieSessionRatings, PlannedMovieSession } from 'src/app/models/session.model';
import { selectActivitieslist } from 'src/app/ngrx/selectors/activity.selectors';
import { selectMovieslist } from 'src/app/ngrx/selectors/movie.selectors';
import { selectUserRoadmap } from 'src/app/ngrx/selectors/roadmap.selectors';
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
export class SummarypanelComponent implements OnInit, OnDestroy {

  // same thing as always : bring the Days in 'this' context
  // so we can use them in the template.
  Days = Days

  moviesForRatings$ = this.store.select(selectMovieslist).pipe(
    map(movies => {
      const byRating = mapMoviesByRating(movies)
      return Array.from(byRating.entries()).map(entry => {
        return {rating: entry[0], movies: entry[1]} as MoviesForRating
      })
    }),
  )

  sessionsForRatings$ = 
    this.store.select(selectPlannedMovieSession).pipe(
    map(sessions => {
      const byRating = mapSessionByRating(sessions)
      return Array.from(byRating.entries()).map(entry => {
        return {rating: entry[0], sessions: entry[1]} as SessionsForRating
      })
    })
  )
  

  roadmap: FestivalRoadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
  roadmapSub!: Subscription

  constructor(private store: Store) {
    this.roadmapSub = this.store.select(selectUserRoadmap).subscribe(rmap => this.roadmap = rmap)
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.roadmapSub.unsubscribe()
  }

  showSelected(target: string){
    const elt = document.getElementById(target)
    elt?.scrollIntoView({behavior: 'smooth'})
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
