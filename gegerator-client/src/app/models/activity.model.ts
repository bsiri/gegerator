import { Time } from "@angular/common";
import { Day } from "./referential.data";


export interface OtherActivity{
    id: number;
    day: Day;
    startTime: Time;
    endTime: Time;
    description: string;
}
