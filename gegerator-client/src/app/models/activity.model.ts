import { PlannableItem } from "./plannable.model";
import { Day, Days } from "./referential.data";
import { Times } from "./time.utils";
import { Time } from "./time.model";


export class OtherActivity implements PlannableItem{
    constructor(
        public id: number,
        public day: Day,
        public startTime: Time,
        public endTime: Time,
        public description: string,
    ){}

    // implements/provides : PlannableItem.name
    public get name(){
        return this.description
    }
    
    // implements : PlannableItem.htmlId
    public get htmlId(){
        return `other-activity-${this.id}`
    }


    public toString(): string{
        return `${this.day.name}, ${Times.toStrInterval(this.startTime, this.endTime)} : ${this.description}`
    }

    /**
     * Will format this activity as a string, 
     * using the following hints:
     * - %d : prints the day
     * - %h : prints the start and end time interval
     * - %n : prints the description
     * 
     * .toString() == .format('%d, %h : %n')
     * @param fmtString 
     */
       public format(fmtString: string) :string{
        return fmtString.replace('%d', this.day.name)
                        .replace('%h', Times.toStrInterval(this.startTime, this.endTime))
                        .replace('%n', this.description)
    }  

    // ********* JSON interface **********

    toJSON(): OtherActivityJSON{
        return {
            id: this.id,
            day: this.day.key,
            startTime : Times.serialize(this.startTime),
            endTime : Times.serialize(this.endTime),
            description: this.description
        }
    }

    static fromJSON(json: OtherActivityJSON): OtherActivity{
        return new OtherActivity(
            json.id, 
            Days.fromKey(json.day),
            Times.deserialize(json.startTime),
            Times.deserialize(json.endTime),
            json.description
        )
    }


}

export interface OtherActivityJSON{    
    id: number 
    day: string 
    startTime: string
    endTime: string
    description: string    
}