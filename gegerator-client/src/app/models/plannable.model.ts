import { Day } from "./referential.data";
import { Time } from "./time.model";

/**
 * Interface for everything that can be 
 * placed on a calendar-ish thing (eg, swimlanes in 
 * the session-section components) 
 */
export interface PlannableItem{
    name: string;
    day: Day;
    startTime: Time;
    endTime: Time;
    htmlId: string;
    
    /**
     * Returns a string representation
     * of this PlannableItem
     */
    toString(): string;

    /**
     * Will format this item as a string, 
     * implementation proposing at least 
     * the following hints:
     * - %d : prints the day
     * - %h : prints the start and end time interval
     * - %n : prints the name
     * 
     * Implementations may propose more options
     * if applicable.
     * @param fmtString 
     */
    format(fmtString: string) : string;
}

