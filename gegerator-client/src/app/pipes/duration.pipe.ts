import { Pipe, PipeTransform } from '@angular/core';
import {Duration, parse} from 'iso8601-duration';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: Duration): unknown {
    const minutes = value.minutes ?? 0
    const twodigitsMinutes = (minutes < 10) ? "0"+minutes : ""+minutes;
    return `${value.hours}h${twodigitsMinutes}m`;
  }

}
