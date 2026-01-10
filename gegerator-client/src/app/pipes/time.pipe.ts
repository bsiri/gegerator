import { Pipe, PipeTransform } from '@angular/core';
import { Times } from '../models/time.utils';
import { Time } from "../models/time.model";

@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {

  transform(value: Time): string {
    return Times.toString(value)
  }

}
