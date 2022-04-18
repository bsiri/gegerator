import { Time } from "@angular/common";
import { Day } from "./referential.data";

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
}