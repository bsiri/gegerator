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
    ){}

    toJSON(): MovieSessionJSON{
        return {
            id: this.id,
            movieId: this.movieId,
            theater: this.theater.key,
            day: this.day.key,
            startTime: Times.serialize(this.startTime)
        }
    }

    static fromJson(json: MovieSessionJSON): MovieSession{
        return new MovieSession(
            json.id, 
            json.movieId,
            Theaters.fromKey(json.theater),
            Days.fromKey(json.day),
            Times.deserialize(json.startTime)
        )
    }
}

export interface MovieSessionJSON{
    id: number,
    movieId: number,
    theater: string,
    day: string,
    startTime: string
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
        public startTime: Time
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
            startTime: this.startTime
        }
    }
}

