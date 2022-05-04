

/*
    Theater : the instances of Theater in Gerardmer.
    They should match the Theater class 
    from the java model.

    Could have been enums, but they prove difficult to 
    work with in Angular templates, and I found using 
    this construct to be easier to manage.
*/

export interface Theater{
    key: string, 
    name: string
}

export class Theaters{
    static ESPACE_LAC: Theater = {key: "ESPACE_LAC", name: "Espace Lac"};
    static CASINO: Theater = {key: "CASINO", name: "Casino"};
    static PARADISO: Theater = {key: "PARADISO", name: "Paradiso"};
    static MCL: Theater = {key: "MCL", name: "MCL"};

    static enumerate(): Theater[]{
        return [this.ESPACE_LAC, this.CASINO, this.PARADISO, this.MCL];
    }

    static fromKey(key: string): Theater{
        const found = Theaters.enumerate().find(t => t.key == key)
        if (!found){
            throw Error(`Programmatic error : unknown theater ${key} !`)
        }
        return found;
    }
}


/*
    Same thing with days.
*/
export class Day implements Comparable<Day>{
    constructor(
    public key: string,
    public rank: number, 
    public name: string
    ){}

    compare(this: Day, other: Day): number {
        return this.rank - other.rank
    }
}

export class Days{
    static THURSDAY = new Day("THURSDAY", 0, "Jeudi");
    static FRIDAY = new Day("FRIDAY", 1, "Vendredi");
    static SATURDAY = new Day("SATURDAY", 2, "Samedi");
    static SUNDAY = new Day("SUNDAY", 3, "Dimanche");

    static enumerate(): readonly Day[]{
        return [this.THURSDAY, this.FRIDAY, this.SATURDAY, this.SUNDAY];
    }

    static fromKey(key: string): Day{
        const found = Days.enumerate().find(t => t.key == key)
        if (!found){
            throw Error(`Programmatic error : unknown day ${key} !`)
        }
        return found;
    }

    static compare(day1: Day, day2: Day): number{
        return day1.compare(day2)
    }
}


/*
    Comarable and comparison utilities
*/

export interface Comparable<T>{
    compare(this: T, other: T) : number
}

/**
 * Returns the array of Things, sorted by the supplied attribute names of those Things. 
 * The attribute names are sorted in the order of declaration, and their type 
 * must be implementors of Comparable<>.
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
        if ('compare' in value){
          return value
        }
      }
      throw new Error(`cannot order by ${attrName} : 
      attribute not found in type ${o.constructor.name}, or is not a Comparable`)
    }
  }
  
  


