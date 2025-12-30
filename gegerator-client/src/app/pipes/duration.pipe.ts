import { Pipe, PipeTransform } from '@angular/core';
import {Duration, parse} from 'iso8601-duration';
import { Durations } from '../models/time.utils';

@Pipe({
    name: 'duration',
    standalone: false
})
export class DurationPipe implements PipeTransform {

  transform(value: Duration): string {
    return Durations.toString(value)
  }

}
