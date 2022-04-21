import { Duration } from "iso8601-duration";
import { Durations } from "./time.utils";

export class Movie{
  constructor(
    public id: number,
    public title: string,
    public duration: Duration
  ){}

  toJSON(): MovieJSON{
    return {
      id: this.id,
      title: this.title, 
      duration: Durations.serialize(this.duration)
    }
  }

  static fromJSON(json: MovieJSON){
    return new Movie(
      json.id,
      json.title, 
      Durations.deserialize(json.duration)
    )
  }
}


export interface MovieJSON{
  id: number
  title: string
  duration: string
}