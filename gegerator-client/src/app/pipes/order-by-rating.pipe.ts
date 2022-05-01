import { Pipe, PipeTransform } from '@angular/core';
import { MovieRating, MovieRatings } from '../models/movie.model';
import { MovieSessionRating, MovieSessionRatings } from '../models/session.model';


/**
 * Sorts an array of things by Ratings. Note that the 
 * ratings types are hardcoded as MovieRating of MovieSessionRating.
 *
 * This lack of robustness and genricity results from overall poor modeling, 
 * sorry for that.
 * 
 */
type Ratable={
  rating: MovieRating | MovieSessionRating
}

@Pipe({
  name: 'orderByRating'
})
export class OrderByRatingPipe implements PipeTransform {

  transform<T extends Ratable>(ratables: T[] | null): T[] {
    if (! ratables){
      return []
    }
    const sample = ratables[0]

    if (MovieRatings.enumerate().includes(sample.rating)){
      return ratables.slice().sort((rat1, rat2) => MovieRatings.compare(rat1.rating, rat2.rating))
    }
    else if (MovieSessionRatings.enumerate().includes(sample.rating)){
      return ratables.slice().sort((rat1, rat2) => MovieSessionRatings.compare(rat1.rating, rat2.rating))
    }
    else{
      throw new Error(`cannot rate objects such as ${sample.toString()} : it has neither a MovieRating nor a MovieSessionRating`)
    }
  }

}
