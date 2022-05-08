import { Movie } from "./movie.model";
import { Day, Days, Theater, Theaters } from "./referential.data";
import { Times } from "./time.utils";
import { Time } from "./time.model";
import { EventRating, EventRatings, PlannableEvent } from "./plannable.model";


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
        public rating: EventRating = EventRatings.DEFAULT
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
            EventRatings.fromKey(json.rating)
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
export class PlannedMovieSession implements PlannableEvent{

    constructor(
        public id: number,
        public movie: Movie,
        public theater: Theater,
        public day: Day,
        public startTime: Time,
        public rating: EventRating = EventRatings.DEFAULT
    ){        
    }

    // implements/provides : PlannableEvent.endTime
    public get endTime(){
        return Times.add(this.startTime, this.movie.duration)   
    }

    // implements/provides : PlannableEvent.htmlId
    public get htmlId(){
        return `planned-movie-session-${this.id}`
    }
    
    // implements/provides: PlannableEvent.name
    public get name(){
        return this.movie.title
    }

    public toString(): string{
        return `${this.day.name}, ${Times.toStrInterval(this.startTime, this.endTime)}, ${this.theater.name} : ${this.movie.title}`
    }

    /**
     * Will format this session as a string, 
     * using the following hints:
     * - %d : prints the day
     * - %h : prints the start and end time interval
     * - %n : prints the movie.
     * - %t : prints the theater
     * 
     * .toString() == .format('%d, %h, %t : %m')
     * @param fmtString 
     */
    public format(fmtString: string) :string{
        return fmtString.replace('%d', this.day.name)
                        .replace('%h', Times.toStrInterval(this.startTime, this.endTime))
                        .replace('%t', this.theater.name)
                        .replace('%n', this.movie.title)
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
        return (this.rating != EventRatings.MANDATORY && modified.rating == EventRatings.MANDATORY)
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

