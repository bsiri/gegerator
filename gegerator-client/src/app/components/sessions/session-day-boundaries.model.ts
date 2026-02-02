import { Duration } from "iso8601-duration"
import { Time, TimeInterval } from "src/app/models/time.model"

/*
    This constant defines the constants on which 
    several css dimentions will be computed by
    the SessionSectionComponent and the 
    PlannedMovieSessionComponent. See these classes
    for the specific of their usage.

    Note: I extend TimeInterval because I'm lazy but 
    it should have been done with composition instead.
*/
export class SessionDayBoundaries extends TimeInterval {
    
    private minuteLenInPixel: number

    constructor(
        dayBeginTime: Time, 
        dayEndTime: Time,
        public hourLenInPixels: number
    ){
        super(dayBeginTime, dayEndTime)
        this.minuteLenInPixel = (this.hourLenInPixels / 60.0)
    }

    /**
     * Returns an array of Time objects representing each hour
     * between the day begin time and day end time.
     * 
     * The enumeration returns whole hours only, i.e. minutes are always 0.
     * In case the start of the day is not at a whole hour (e.g. 08:30),
     * the first hour returned will be the next whole hour (e.g. 09:00). 
     * 
     * @param step 
     * @param skipFirstAndLast 
     * @returns 
     */
    enumerateHours(step = 1): Time[] {
        const hours: Time[] = []
        let currentHour = this.start.hours ?? 0
        if((this.start.minutes ?? 0) > 0){
            currentHour += 1
        }
        const endHour = this.end.hours ?? 0

        while(currentHour <= endHour){
            hours.push( new Time(currentHour, 0) )
            currentHour += step
        }

        return hours
    }

    /**
        Returns the height (in pixels) that a session Day should have when rendered in 
        the Session section. 
    */
    sessionDayInPixel(): number{
        const lenEnd = this.durationInPixel(this.end)
        const lenBegin = this.durationInPixel(this.start)
        // const extra = 2*this.hourLenInPixels

        // return (lenEnd - lenBegin) + extra
        return (lenEnd - lenBegin) 
    }

    /*
        Returns the height in pixel to represent a given Duration.  
    */
    durationInPixel(duration: Duration | Time): number{
        const [hours, minutes] = [duration.hours ?? 0, duration.minutes ?? 0]
        const height = hours * this.hourLenInPixels + minutes * this.minuteLenInPixel    
        return Math.floor(height);
    }

    timeDifferenceInPixel(start: Time, end: Time): number{
        return this.durationInPixel(end) - this.durationInPixel(start)
    }


    /*
        Represent the offset in pixel that separate the given Time and the start of 
        the Session Day  .
    */
    offsetFromDayStartInPixel(time: Time): number {
        return this.durationInPixel(time) - this.durationInPixel(this.start)
    }

}


// ************************ constants **********************/

// TODO: these are really configuration constants and should be 
// moved to a configuration file at some point.

/*
    A Day starts at 08:00 and ends at 26:00 (i.e. 2AM next day)
*/
export const SESSION_DAY_BOUNDARIES: SessionDayBoundaries = new SessionDayBoundaries(
  new Time(7, 30),
  new Time(26, 0),
  100
)

/*
    Events (like movie sessions) are plannable only from 08:00 to 23h59
    because I cannot yet handle start and end times that goes over midnight
    (it would mean handling the change of day and I have not yet implemented that).

    This means that:
    - other activities must start and end before midnight, because no time 
      can technically be inputed after that,
    - movie session must also start before midnight, but can end after that 
      because the endtime is not inputed, but derived from its duration.
*/
export const PLANNABLE_EVENT_TIME_INTERVAL: TimeInterval = new TimeInterval(
    new Time(8,0),
    new Time(23, 59)
)