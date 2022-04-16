import { Time } from "@angular/common"
import { Duration } from "iso8601-duration"

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
        the Session section.
    */
    sessionDayInPixel(): number{
        return this.lenInPixel(this.dayEndTime) - this.lenInPixel(this.dayBeginTime)
    }

    /*
        Returns the height in pixel to represent a given Duration.  
    */
    lenInPixel(duration: Duration | Time): number{
        const [hours, minutes] = [duration.hours ?? 0, duration.minutes ?? 0]
        const height = hours * this.hourLenInPixels + minutes * this.minuteLenInPixel    
        return Math.floor(height);
    }

    /*
        Represent the offset in pixel that separate the given Time and the start of 
        the Session Day  .
    */
    offsetFromDayBeginInPixel(time: Time): number {
        return this.lenInPixel(time) - this.lenInPixel(this.dayBeginTime)
    }

}

export const SESSION_DAY_BOUNDARIES: SessionDayBoundaries = new SessionDayBoundaries(
  {hours: 8, minutes: 0} as Time,
  {hours:25, minutes: 0} as Time,
  100
)
