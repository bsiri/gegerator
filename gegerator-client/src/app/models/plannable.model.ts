import { Day, Days } from "./referential.data";
import { Time, Times } from "./time.utils";

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
}

export namespace PlannableItems{
    export function compare(item1: PlannableItem, item2: PlannableItem): number{
        const cmpDays = Days.compare(item1.day, item2.day)
        if (cmpDays != 0){
            return cmpDays
        }
        return Times.compare(item1.startTime, item2.startTime)
    }
}
