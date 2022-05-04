import { Movie } from "./movie.model";
import { PlannableItem } from "./plannable.model";
import { Comparable, Day, Days, Theater, Theaters } from "./referential.data";
import { Time, Times } from "./time.utils";


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

    // implements/provides : PlannableItem.htmlId
    public get htmlId(){
        return `planned-movie-session-${this.id}`
    }
    
    // implements/provides: PlannableItem.name
    public get name(){
        return this.movie?.title ?? ''
    }

    public toString(): string{
        return `${this.day.name}, ${Times.toStrInterval(this.startTime, this.endTime)}, ${this.theater.name} : ${this.movie.title}`
    }


    /**
     * Asks whether the changes made to that entity
     * are likely to require a full reload of PlannedMovieSessions
     * due to business rules performed by the server.
     * 
     * @param modified 
     */
    public checkChangesRequireReload(modified: PlannedMovieSession): boolean{
        // R1. : if Rating transitionned to MANDATORY, reload is necessary.
        return (this.rating != MovieSessionRatings.MANDATORY && modified.rating == MovieSessionRatings.MANDATORY)
    }

    toMovieSession(){
        return new MovieSession(
            this.id,
            this.movie.id,
            this.theater,
            this.day,
            this.startTime,
            this.rating
        )
    }

    copy(modifiers = {}): PlannedMovieSession{
        const _clone = new PlannedMovieSession(
            this.id,
            this.movie,
            this.theater,
            this.day,
            this.startTime,
            this.rating
        )
        Object.assign(_clone, modifiers)
        return _clone
    }
}

// *********** "Enum" MovieSessionRating (see referential.data.ts for explanations) **************

export class MovieSessionRating implements Comparable<MovieSessionRating>{
    constructor(
        public key: string, 
        public rank: number,
        public name: string,
        public description: string
    ){}

    compare(this: MovieSessionRating, other: MovieSessionRating): number {
        return this.rank - other.rank
    }
  }
  
  export class MovieSessionRatings{
    static MANDATORY= new MovieSessionRating( 
      "MANDATORY",
      0, 
      "Impérative",
      "Je veux voir ce film à cette séance précise"
    );
    static DEFAULT = new MovieSessionRating( 
      "DEFAULT", 
      1,
      "Normale",
      "Laisser l'algorithme décider"
    );
    static NEVER = new MovieSessionRating( 
      "NEVER",
      2, 
      "Jamais",
      "Pas cette séance là"
    );
  
    static enumerate(): readonly MovieSessionRating[]{
      return [this.MANDATORY, this.DEFAULT, this.NEVER]
    }
  
    static fromKey(key: string): MovieSessionRating{
      const found = MovieSessionRatings.enumerate().find(r => r.key == key)
      if (! found){
        throw Error(`Programmatic error : unknown movie rating ${key} !`)
      }
      return found;
    }

    static compare(rating1: MovieSessionRating, rating2: MovieSessionRating): number{
        return rating1.compare(rating2)
    }
  }
  
  