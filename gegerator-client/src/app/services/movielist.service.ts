import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { Movie } from '../models/movie';
import { parse } from 'iso8601-duration';


const moviesUrl = "/gegerator/movies"

const options = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class MovielistService{

  constructor(private http: HttpClient) {}

  getAll(): Observable<Movie[]>{
    return this.http.get<JsonMovie[]>(moviesUrl, options)
      .pipe(
        map(allMovies => {
          return allMovies.map(m => this._toMovie(m))
        })
      );
  }


  save(movie: Movie): Observable<Movie>{
    const jsmovie = this._toJsonMovie(movie);
    return this.http.put<JsonMovie>(moviesUrl,jsmovie,options)
    .pipe(
      map(responsemovie => {
          return this._toMovie(responsemovie) 
      })
    );
  }


  private _toJsonMovie(item: Movie): JsonMovie{
    const [hours, minutes] = [item.duration.hours, item.duration.minutes];
    return {
      id: item.id, 
      title: item.title,
      duration: `PT${hours}H${minutes}M`
    }
  }

  private _toMovie(item: JsonMovie): Movie{
    return {
      id: item.id,
      title: item.title,
      duration: parse(item.duration)
    };
  }
}

class JsonMovie{
  id: number;
  title: string;
  duration: string;
  constructor(id: number, title: string, duration: string){
    this.id = id;
    this.title = title;
    this.duration = duration;
  }
}
