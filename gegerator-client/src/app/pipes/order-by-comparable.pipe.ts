import { Pipe, PipeTransform } from '@angular/core';
import { Comparable, sortByComparableAttributes } from '../models/referential.data';


/**
 * Pipe that sorts a list of things by one or several attributes, 
 * that must all be implementors of Comparable. 
 * 
 * If multiple attributes are indicated, the sort will happen 
 * by order of declaration.
 * 
 * Since the attributes are referenced by name
 * it is inherently not type safe.
 * 
 */

type Comparator<T> = (o1: T, o2: T) => number

@Pipe({
  name: 'orderByComparable'
})
export class OrderByComparablePipe implements PipeTransform {

  transform<T extends any>(toSort: readonly T[] | null, ...attrNames: string[] ): T[] {
    return sortByComparableAttributes(toSort, ...attrNames) 
  }

}


