import { Pipe, PipeTransform } from '@angular/core';
import { PlannableItem, PlannableItems } from '../models/plannable.model';


@Pipe({
  name: 'orderByDateTime'
})
export class OrderByDateTimePipe implements PipeTransform {

  transform(plannableArray: readonly PlannableItem[] | null): PlannableItem[] {
    if (! plannableArray){
      return []
    }
    return plannableArray.slice().sort(PlannableItems.compare)
  }

}
