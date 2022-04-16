import { Time } from "@angular/common";
import { Movie } from "./movie";
import { Day, Theater } from "./referential.data";


/*
    This is the raw model of a MovieSession, 
    as it is consumed by the server
*/
export interface MovieSession{
    id: number;
    movieId: number;
    theater: Theater;
    day: Day;
    startTime: Time;
}


/*
    This is a model of a PlannedMovieSession, as consumed
    by the PlannedMovieComponent. It is an aggregate of 
    a Movie, MovieSession and (soon) Constraints relative
    to that session.
*/
export class PlannedMovieSession{

    constructor(
        public id: number,
        public movie: Movie,
        public theater: Theater,
        public day: Day,
        public startTime: Time
    ){        
    }

    public get endTime(){
        // yet more time arithmetic computed by myself
        const [movieHours, movieMinutes] =  [this.movie.duration.hours ?? 0, this.movie.duration.minutes ?? 0]
        const totalMovieMinutes = movieHours*60 + movieMinutes 

        const [startHours, startMinutes] =  [this.startTime.hours, this.startTime.minutes]
        
        const newStartMinutes = (startMinutes + totalMovieMinutes) % 60
        const newStartHours = startHours + Math.floor((startMinutes + totalMovieMinutes) / 60)

        return {hours: newStartHours, minutes: newStartMinutes}   
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

