import { Duration } from "iso8601-duration";
import { Comparable } from "./comparable.interface";



export class Time implements Comparable<Time> {
    constructor(
        public hours: number,
        public minutes: number
    ) { }

    compare(this: Time, other: Time): number {
        return this.toMinutes() - other.toMinutes();
    }

    toMinutes(): number {
        return this.hours * 60 + this.minutes;
    }


    /**
     * Tests whether this time is before the 'referenceTime',
     * inclusive (equality counts are True)
     * @param testedTime
     * @param referenceTime
     */
    isBefore(referenceTime: Time): boolean {
        return this.toMinutes() <= referenceTime.toMinutes();
    }

    /**
     * Tests whether this Time is after the 'referenceTime',
     * inclusive (equality counts are True)
     * @param testedTime
     * @param referenceTime
     */
    isAfter(referenceTime: Time): boolean {
        return this.toMinutes() >= referenceTime.toMinutes();
    }

    add(delta: Duration): Time {
        const [deltaHours, deltaMinutes] = [delta.hours ?? 0, delta.minutes ?? 0];
        const totalDeltaMinutes = deltaHours * 60 + deltaMinutes;

        const newStartMinutes = (this.minutes + totalDeltaMinutes) % 60;
        const newStartHours = this.hours + Math.floor((this.minutes + totalDeltaMinutes) / 60);

        return new Time(newStartHours, newStartMinutes);
    }
}
