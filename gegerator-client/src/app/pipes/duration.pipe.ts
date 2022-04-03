import { Pipe, PipeTransform } from '@angular/core';
import {Duration, parse} from 'iso8601-duration';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: Duration): unknown {
    return `${value.hours}h${value.minutes}m`;
  }

}
