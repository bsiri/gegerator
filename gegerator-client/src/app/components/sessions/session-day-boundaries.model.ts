import { Duration } from "iso8601-duration"
import { Times } from "src/app/models/time.utils"
import { Time } from "src/app/models/time.model"

/*
    This constant defines the constants on which 
    several css dimentions will be computed by
    the SessionSectionComponent and the 
    PlannedMovieSessionComponent. See these classes
    for the specific of their usage.
*/
export class SessionDayBoundaries{
    
    private minuteLenInPixel: number

    constructor(
        public dayBeginTime: Time, 
        public dayEndTime: Time,
        public hourLenInPixels: number
    ){
        this.minuteLenInPixel = (this.hourLenInPixels / 60.0)
    }

    /*
        Returns the height (in pixels) that a session Day should have when rendered in 
        the Session section. It also adds an extra 2 hours to account for midnight sessions.
    */
    sessionDayInPixel(): number{
        const lenEnd = this.durationInPixel(this.dayEndTime)
        const lenBegin = this.durationInPixel(this.dayBeginTime)
        const extra = 2*this.hourLenInPixels

        return (lenEnd - lenBegin) + extra
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
    offsetFromDayBeginInPixel(time: Time): number {
        return this.durationInPixel(time) - this.durationInPixel(this.dayBeginTime)
    }

    /**
     * Returns whether the given time is withing the session day boundaries
     * @param time 
     */
    isInRange(time: Time): boolean{
        return Times.isAfter(time, this.dayBeginTime) && Times.isBefore(time, this.dayEndTime)
    }

    toString(): string{
        return `${Times.toString(this.dayBeginTime)} - ${Times.toString(this.dayEndTime)}`
    }

}

export const SESSION_DAY_BOUNDARIES: SessionDayBoundaries = new SessionDayBoundaries(
  {hours: 8, minutes: 0} as Time,
  {hours:23, minutes: 59} as Time,
  100
)
 