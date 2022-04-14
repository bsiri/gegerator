import { Movie } from "./movie";
import { Theater } from "./referential.data";


/*
    This is the raw model of a MovieSession, 
    as it is consumed by the server
*/
export interface RawSession{
    id: number;
    movieId: number;
    theater: Theater;
    startTime: Date;
}


/*
    This is a model of a MovieSession, as consumed
    by the MovieSessionComponent.
*/
export class MovieSession{
    constructor(
        public id: number,
        public movie: Movie,
        public theater: Theater,
        public startTime: Date
    ){}

    toRawSession(){
        return {
            id: this.id,
            movieId: this.movie.id,
            theater: this.theater,
            startTime: Date
        }
    }
}

