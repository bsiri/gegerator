/*
    Comparable and comparison utilities
*/

export interface Comparable<T>{
    compare(this: T, other: T) : number
}

class PrimitiveComparable<T> implements Comparable<PrimitiveComparable<T>>{
  constructor(public value: T){}
  compare(this: PrimitiveComparable<T>, other: PrimitiveComparable<T>): number {
    return this.value < other.value ? -1 : 1
  }
}

/**
 * Returns the array of Things, sorted by the supplied attribute names of those Things. 
 * The attribute names are sorted in the order of declaration, and their type 
 * must be implementors of Comparable<> or primitive.
 * 
 * @param toSort 
 * @param attrNames 
 * @returns 
 */
export function sortByComparableAttributes<T extends any>(toSort: readonly T[] | null, ...attrNames: string[] ): T[] {
    if (! toSort){
    return []
  }
  
  return toSort.slice().sort(chainComparator(...attrNames))

}

/**
 * Returns a comparator function that obey the same behavior and constraints than 
 * described in "sortByComparableAttributes"
 * 
 * @param attrNames 
 * 
 */
export function chainComparator<T extends any>(...attrNames: string[]): (o1: T, o2: T) => number{
    return (o1: T, o2: T) => {
        let cmpRes = NaN
        for (let attr of attrNames){
          const getter = _makeGetter(attr)
          cmpRes = getter(o1).compare(getter(o2))
          if (cmpRes != 0) {
            return cmpRes
          }
        }
        return 0        
    }
}


function _makeGetter<C extends Comparable<C>>(attrName: string): (o: any) => C{
    return (o: any): C => {
      if (attrName in o){
        const value = o[attrName]
        if (typeof value !== 'object'){
          return new PrimitiveComparable(value) as unknown as C
        }
        if ('compare' in value){
          return value
        }
      }
      throw new Error(`cannot order by ${attrName} : 
      attribute not found in type ${o.constructor.name}, or is not a Comparable or a primitive`)
    }
}



  


