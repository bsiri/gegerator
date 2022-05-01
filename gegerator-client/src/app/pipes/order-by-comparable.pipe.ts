import { Pipe, PipeTransform } from '@angular/core';
import { Comparable } from '../models/referential.data';


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
    if (! toSort){
      return []
    }
    
    return toSort.slice().sort((o1: T, o2: T) => {
      let cmpRes = NaN
      for (let attr of attrNames){
        const getter = makeGetter(attr)
        cmpRes = getter(o1).compare(getter(o2))
        if (cmpRes != 0) {
          return cmpRes
        }
      }
      return 0
    })

  }

}



function makeGetter<C extends Comparable<C>>(attrName: string): (o: any) => C{
  return (o: any): C => {
    if (attrName in o){
      const value = o[attrName]
      if ('compare' in value){
        return value
      }
    }
    throw new Error(`cannot order by ${attrName} : 
    attribute not found in type ${o.constructor.name}, or is not a Comparable`)
  }
}

