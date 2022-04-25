import { Duration } from "iso8601-duration";
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
}


export interface MovieJSON{
  id: number
  title: string
  duration: string
  rating: string
}

// *********** "Enum" MovieRating (see referential.data.ts for explanations) **************

export interface MovieRating{
  key: string, 
  name: string,
  description: string
}

export class MovieRatings{
  static HIGHEST: MovieRating = { 
    key: "HIGHEST", 
    name: "Très haute",
    description: "Je veux absolument voir ce film"
  };
  static HIGH: MovieRating = { 
    key: "HIGH",
    name: "Haute", 
    description: "Je veux voir ce film, si on a le temps"
  };
  static DEFAULT: MovieRating = { 
    key: "DEFAULT", 
    name: "Normale",
    description: "Je veux bien voir ce film, si on a rien d'autre à faire"
  };
  static NEVER: MovieRating = { 
    key: "NEVER", 
    name: "Jamais",
    description: "Je ne veux jamais voir ce film"
  };

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
}

