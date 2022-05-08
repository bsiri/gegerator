import { Comparable } from "./comparable.interface";
import { Day } from "./referential.data";
import { Time } from "./time.model";

/**
 * Interface for everything that can be 
 * placed on a calendar-ish thing (eg, swimlanes in 
 * the session-section components) 
 */
export interface PlannableEvent{
    name: string;
    day: Day;
    startTime: Time;
    endTime: Time;
    htmlId: string;
    rating: EventRating;
    
    /**
     * Returns a string representation
     * of this PlannableEvent
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

// *********** "Enum" EventRating (see referential.data.ts for explanations) **************

export class EventRating implements Comparable<EventRating>{
    constructor(
        public key: string, 
        public rank: number,
        public name: string,
        public description: string
    ){}

    compare(this: EventRating, other: EventRating): number {
        return this.rank - other.rank
    }
  }
  
  export class EventRatings{
    static MANDATORY= new EventRating( 
      "MANDATORY",
      0, 
      "Impérative",
      "On y va c'est sûr"
    );
    static DEFAULT = new EventRating( 
      "DEFAULT", 
      1,
      "Normale",
      "Pas d'avis"
    );
    static NEVER = new EventRating( 
      "NEVER",
      2, 
      "Jamais",
      "C'est sûr on ira pas"
    );
  
    static enumerate(): readonly EventRating[]{
      return [this.MANDATORY, this.DEFAULT, this.NEVER]
    }
  
    static fromKey(key: string): EventRating{
      const found = EventRatings.enumerate().find(r => r.key == key)
      if (! found){
        throw Error(`Programmatic error : unknown movie rating ${key} !`)
      }
      return found;
    }

    static compare(rating1: EventRating, rating2: EventRating): number{
        return rating1.compare(rating2)
    }
  }
  
  
