import { Time } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Times } from '../models/time.utils';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: Time): string {
    return Times.toString(value)
  }

}
