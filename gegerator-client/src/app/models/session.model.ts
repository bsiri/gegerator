import { Time } from "@angular/common";
import { Movie } from "./movie.model";
import { PlannableItem } from "./plannable.model";
import { Day, Days, Theater, Theaters } from "./referential.data";
import { Times } from "./time.utils";


/*
    This is the raw model of a MovieSession, 
    as it is consumed by the server
*/
export class MovieSession{
    constructor(
        public id: number,
        public movieId: number,
        public theater: Theater,
        public day: Day,
        public startTime: Time,
        public rating: MovieSessionRating = MovieSessionRatings.DEFAULT
    ){}

    toJSON(): MovieSessionJSON{
        return {
            id: this.id,
            movieId: this.movieId,
            theater: this.theater.key,
            day: this.day.key,
            startTime: Times.serialize(this.startTime),
            rating: this.rating.key
        }
    }

    static fromJson(json: MovieSessionJSON): MovieSession{
        return new MovieSession(
            json.id, 
            json.movieId,
            Theaters.fromKey(json.theater),
            Days.fromKey(json.day),
            Times.deserialize(json.startTime),
            MovieSessionRatings.fromKey(json.rating)
        )
    }
}

export interface MovieSessionJSON{
    id: number,
    movieId: number,
    theater: string,
    day: string,
    startTime: string,
    rating: string
}



/*
    This is a model of a PlannedMovieSession, as consumed
    by the PlannedMovieComponent. It is an aggregate of 
    a Movie, MovieSession and (soon) Constraints relative
    to that session.
*/
export class PlannedMovieSession implements PlannableItem{

    constructor(
        public id: number,
        public movie: Movie,
        public theater: Theater,
        public day: Day,
        public startTime: Time,
        public rating: MovieSessionRating = MovieSessionRatings.DEFAULT
    ){        
    }

    // implements/provides : PlannableItem.endTime
    public get endTime(){
        return Times.add(this.startTime, this.movie.duration)   
    }

    
    // implements/provides: PlannableItem.name
    public get name(){
        return this.movie?.title ?? ''
    }

    toMovieSession(){
        return {
            id: this.id,
            movieId: this.movie.id,
            theater: this.theater,
            day: this.day,
            startTime: this.startTime,
            rating: this.rating
        }
    }
}

// *********** "Enum" MovieSessionRating (see referential.data.ts for explanations) **************

export interface MovieSessionRating{
    key: string, 
    name: string,
    description: string
  }
  
  export class MovieSessionRatings{
    static HIGHEST: MovieSessionRating = { 
      key: "MANDATORY", 
      name: "Impérative",
      description: "Je veux voir ce film à cette séance précise"
    };
    static DEFAULT: MovieSessionRating = { 
      key: "DEFAULT", 
      name: "Normale",
      description: "Laisser l'algorithme décider"
    };
    static NEVER: MovieSessionRating = { 
      key: "NEVER", 
      name: "Jamais",
      description: "Pas cette séance là"
    };
  
    static enumerate(): readonly MovieSessionRating[]{
      return [this.HIGHEST, this.DEFAULT, this.NEVER]
    }
  
    static fromKey(key: string): MovieSessionRating{
      const found = MovieSessionRatings.enumerate().find(r => r.key == key)
      if (! found){
        throw Error(`Programmatic error : unknown movie rating ${key} !`)
      }
      return found;
    }
  }
  
  