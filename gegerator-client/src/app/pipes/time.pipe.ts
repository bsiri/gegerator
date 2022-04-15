import { Time } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: Time): string {
    const minutes = value.minutes ?? 0
    const twodigitsMinutes = (minutes < 10) ? "0"+minutes : ""+minutes;
    return `${value.hours}:${twodigitsMinutes}`;
  }

}
