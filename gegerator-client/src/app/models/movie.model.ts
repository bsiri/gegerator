import { Duration } from "iso8601-duration";
import { Comparable } from "./comparable.interface";
import { Durations } from "./time.utils";

export class Movie{
  constructor(
    public id: number,
    public title: string,
    public duration: Duration,
    public rating: MovieRating = MovieRatings.DEFAULT
  ){}

  toJSON(): MovieJSON{
    return {
      id: this.id,
      title: this.title, 
      duration: Durations.serialize(this.duration),
      rating: this.rating.key
    }
  }

  static fromJSON(json: MovieJSON){
    return new Movie(
      json.id,
      json.title, 
      Durations.deserialize(json.duration),
      MovieRatings.fromKey(json.rating)
    )
  }

  copy(modifiers = {}): Movie{
    const _clone = new Movie(
      this.id,
      this.title,
      this.duration, 
      this.rating
    )
    Object.assign(_clone, modifiers)
    return _clone
  }

}



export interface MovieJSON{
  id: number
  title: string
  duration: string
  rating: string
}

// *********** "Enum" MovieRating (see referential.data.ts for explanations) **************

export class MovieRating implements Comparable<MovieRating>{
  constructor(
    public key: string, 
    public rank: number,
    public name: string,
    public description: string){ }

    compare(this: MovieRating, other: MovieRating): number {
      return this.rank - other.rank
    }
}

export class MovieRatings{
  static HIGHEST = new MovieRating( 
    "HIGHEST", 
    0,
    "Très haute",
    "Je veux absolument voir ce film"
  );
  static HIGH = new MovieRating( 
    "HIGH",
    1,
    "Haute", 
    "Je veux voir ce film, si on a le temps"
  );
  static DEFAULT = new MovieRating( 
    "DEFAULT", 
    2,
    "Normale",
    "Je veux bien voir ce film, si on n'a rien d'autre à faire"
  );
  static NEVER = new MovieRating( 
    "NEVER", 
    3,
    "Jamais",
    "Je ne veux jamais voir ce film"
  );

  static enumerate(): readonly MovieRating[]{
    return [this.HIGHEST, this.HIGH, this.DEFAULT, this.NEVER]
  }

  static fromKey(key: string): MovieRating{
    const found = MovieRatings.enumerate().find(r => r.key == key)
    if (! found){
      throw Error(`Programmatic error : unknown movie rating ${key} !`)
    }
    return found;
  }

  static compare(rating1: MovieRating, rating2: MovieRating): number{
    return rating1.compare(rating2)
  }
}

