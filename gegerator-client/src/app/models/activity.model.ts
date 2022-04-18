import { Time } from "@angular/common";
import { PlannableItem } from "./plannable.model";
import { Day } from "./referential.data";


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

}
