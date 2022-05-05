/*
    Because we always need time utils, even if good 
    libraries exist already.

    The distinctions we make between Duration and Time, 
    although very similar structuraly, are :
    - Duration : it's a duration
    - Time : it's an point in time

    To enforce this semantic difference their representation
    may differ. 
*/

import { ValidationErrors } from "@angular/forms";
import { Duration, parse } from "iso8601-duration";
import { Comparable } from "./comparable.interface";


export class Time implements Comparable<Time>{
    constructor(
        public hours: number,
        public minutes: number
    ){}

    compare(this: Time, other: Time): number {
        return this.toMinutes() - other.toMinutes()
    }

    toMinutes(): number{
        return this.hours*60 + this.minutes
    }


    /**
     * Tests whether this time is before the 'referenceTime', 
     * inclusive (equality counts are True)
     * @param testedTime 
     * @param referenceTime 
     */
    isBefore(referenceTime: Time): boolean{
        return this.toMinutes() <= referenceTime.toMinutes()
    }

    /**
     * Tests whether this Time is after the 'referenceTime', 
     * inclusive (equality counts are True)
     * @param testedTime 
     * @param referenceTime 
     */
    isAfter(referenceTime: Time): boolean{
        return this.toMinutes() >= referenceTime.toMinutes()
    }

    add(delta: Duration): Time{
        const [deltaHours, deltaMinutes] =  [delta.hours ?? 0, delta.minutes ?? 0]
        const totalDeltaMinutes = deltaHours*60 + deltaMinutes 
        
        const newStartMinutes = (this.minutes + totalDeltaMinutes) % 60
        const newStartHours = this.hours + Math.floor((this.minutes + totalDeltaMinutes) / 60)

        return new Time(newStartHours, newStartMinutes)
    }
}


// duck typing
type TimeDurationLike = {
    hours: number;
    minutes: number;
}


// duration : hours (1 digit) 'h' minutes (2 digits)
const durationEx: RegExp = RegExp(/^(\d)h([0-5]\d)$/);
// time : hours (1 or 2 digits) ':' minutes (2 digits)
const timeEx: RegExp = RegExp(/^(\d\d?):([0-5]\d)$/)

export namespace Durations{


    // *** Human readable representation ***
    export function toString(duration: Duration): string{
        return _toString(duration)
    }

    export function fromString(strDuration: string): Duration{
        return _fromString(strDuration, durationEx)
    }
    

    // *** JSON representation ***
    export function serialize(duration: Duration) : string{
        const [hours, minutes] = [duration.hours, duration.minutes];
        return `PT${hours}H${minutes}M`
    }
    
    export function deserialize(strDuration: string) : Duration{
        return parse(strDuration)
    }

    
}


export namespace Times{
    // *** Human readable representation ***
    export function toString(time: Time): string{
        return _toString(time, ':')    
    }

    export function fromString(strTime: string): Time{
        const timeLike: TimeDurationLike = _fromString(strTime, timeEx)
        return new Time(timeLike.hours, timeLike.minutes)
    }

    // *** JSON representation ***
    export function serialize(time: Time) : string{
        const hours = twoDigitsStr(time.hours)
        const minutes = twoDigitsStr(time.minutes)
        return `${hours}:${minutes}:00`   
    }
    
    export function deserialize(strTime: string) : Time{
        const [strhours, strminutes] = strTime.split(':')
        const [hours, minutes] = [parseInt(strhours), parseInt(strminutes)]
        return new Time(hours, minutes)    
    }

    export function add(start: Time, delta: Duration) : Time{
        return start.add(delta)      
    }

    /**
     * Tests whether the 'testedTime' is before the 'referenceTime', 
     * inclusive (equality counts are True)
     * @param testedTime 
     * @param referenceTime 
     */
    export function isBefore(testedTime: Time, referenceTime: Time): boolean{
        return testedTime.isBefore(referenceTime)
    }

    /**
     * Tests whether the 'testedTime' is after the 'referenceTime', 
     * inclusive (equality counts are True)
     * @param testedTime 
     * @param referenceTime 
     */
    export function isAfter(testedTime: Time, referenceTime: Time): boolean{
        return testedTime.isAfter(referenceTime)
    }

    export function toMinutes(time: Time): number{
        return time.toMinutes()
    }

    export function compare(time1: Time, time2: Time){
        return time1.compare(time2)
    }

    export function toStrInterval(start: Time, end: Time){
        return `${toString(start)} - ${toString(end)}`
    }
}


function _toString(value: Time | Duration, sep: string = 'h'): string{
    if (!value){
        return "";
    }

    const minutes = value.minutes ?? 0
    const twodigitsMinutes = twoDigitsStr(minutes)
    return `${value.hours}${sep}${twodigitsMinutes}`;    
}

function _fromString(strValue: string, expr: RegExp) : TimeDurationLike {
    const match = strValue.trim().match(expr)
    if (! match){
      throw { value: strValue} as ValidationErrors;
    }
    const [hours, minutes] = match.slice(1).map(i => parseInt(i));
    return {hours, minutes};           
}


/**
 * Returns the given number as a two-digit string, 
 * padding with a left '0' if necessary.
 * @param someNumber 
 */
function twoDigitsStr(someNumber: number): string{
    const absNum = Math.abs(someNumber)
    const signPrefix = (someNumber < 0) ? "-" : ""
    const padded = (absNum < 10) ? "0"+absNum : ""+absNum

    return `${signPrefix}${padded}`
}