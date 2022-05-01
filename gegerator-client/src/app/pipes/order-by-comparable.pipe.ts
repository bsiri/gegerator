import { Pipe, PipeTransform } from '@angular/core';
import { Comparable } from '../models/referential.data';


/**
 * Pipe that sorts a list of things by a comparable 
 * attribute. Since the attribute is referenced by name
 * it is inherently not type safe.
 * 
 */
@Pipe({
  name: 'orderByComparable'
})
export class OrderByComparablePipe implements PipeTransform {

  transform<C extends Comparable<C>, T extends any>(toSort: T[] | null, attrName: string ): T[] {
    if (! toSort){
      return []
    }
    const getattr = (o: any): C => {
      if (attrName in o){
        const value = o[attrName]
        if ('compare' in value){
          return value
        }
      }
      throw new Error(`cannot order by ${attrName} : 
      attribute not found in type ${o.constructor.name}, or is not a Comparable`)
    }
    return toSort.sort((elt1, elt2) => getattr(elt1).compare(getattr(elt2)))

  }

}
