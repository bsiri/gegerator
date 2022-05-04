import { OrderByComparablePipe } from "../pipes/order-by-comparable.pipe";
import { OtherActivity } from "./activity.model";
import { Movie } from "./movie.model";
import { PlannableItem } from "./plannable.model";
import { chainComparator, Day, Days, sortByComparableAttributes } from "./referential.data";
import { MovieSession, PlannedMovieSession } from "./session.model";



/**
 * A Roadmap is a collection of PlannedMovieSession
 * and OtherActivities that constitute a viable final
 * planning for the festival.
 */
export class FestivalRoadmap{

    constructor(
        public sessions: readonly PlannedMovieSession[], 
        public activities: readonly OtherActivity[]){

        }

    /**
     * Says whether the given Movie | PlannedMovieSession | OtherActivity is 
     * part of that Roadmap.
     * 
     * @param movie 
     */
    isInRoadmap(movie: Movie): boolean
    isInRoadmap(session: PlannedMovieSession): boolean
    isInRoadmap(activity: OtherActivity): boolean
    isInRoadmap(something: Movie | PlannedMovieSession | OtherActivity): boolean{
        if (something instanceof Movie){
            return this.sessions.find(session => session.movie.id == something.id) !== undefined
        }
        else if(something instanceof PlannedMovieSession){
            return this.sessions.find(session => session.id == something.id) !== undefined
        }
        else if (something instanceof OtherActivity){
            return this.activities.find(act => act.id == something.id) !== undefined
        }
        else{
            throw new Error(`Illegal argument : ${something}`)
        }
    }

    /**
     * Returns, if exists, the PlannedMovieSession in which the given Movie has 
     * been planned in this Roadmap, or undefined if that Movie is not in the 
     * Roadmap.
     *  
     * @param movie 
     * @returns 
     */
    maybeGetSessionForMovie(movie: Movie): PlannedMovieSession | undefined{
        return this.sessions.find(session => session.movie.id == movie.id)
    }

    
    /**
     * @returns day by day, and sorted by time, the items that 
     * constitutes that roadmap.
     */
    finalized(): Map<Day, Array<PlannableItem>>{
        const finalized = new Map<Day, PlannableItem[]>(Days.enumerate().map(day => [day, []]))

        let allPlannable: PlannableItem[] = [...this.sessions, ...this.activities].sort(chainComparator('day', 'startTime'))

        allPlannable.forEach(plannable => finalized.get(plannable.day)?.push(plannable))
        
        return finalized
    }

}