import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that sorts a list of things by comparing 
 * a specify string attribute, lowercase.
 * 
 * Note that this is therefore inherently not type-safe
 * and you can expect runtime errors if you go sloppy.
 * 
 */
@Pipe({
    name: 'orderByLowercase',
    standalone: false
})
export class OrderByLowercasePipe implements PipeTransform {

  transform<T extends any>(arr: T[], attrName: string): T[] {
    const getattr = (o: any): string => {
      if (attrName in o){
        return o[attrName] as string
      }
      throw new Error(`cannot order by ${attrName} : attribute not found in type ${o.constructor.name}`)
    }
    return arr.slice().sort((o1, o2) => {
      return getattr(o1).toLocaleLowerCase().localeCompare
            (getattr(o2).toLocaleLowerCase())
    })

  }

}
