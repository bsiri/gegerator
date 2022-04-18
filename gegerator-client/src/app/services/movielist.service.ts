import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'
import { map, mergeMap, Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { Durations } from '../models/time.utils';


const moviesUrl = "/gegerator/movies"


@Injectable({
  providedIn: 'root'
})
export class MovielistService{

  constructor(private http: HttpClient) {}

  getAll(): Observable<Movie[]>{
    return this.http.get<JsonMovie[]>(moviesUrl)
      .pipe(
        map(allMovies => {
          return allMovies.map(m => this._toMovie(m))
        })
      );
  }


  save(movie: Movie): Observable<Movie>{
    const jsmovie = this._toJsonMovie(movie);
    return this.http.post<JsonMovie>(moviesUrl, jsmovie)
    .pipe(
      map(responsemovie => {
          return this._toMovie(responsemovie) 
      })
    );
  }

  update(movie: Movie): Observable<Movie>{
    const jsmovie = this._toJsonMovie(movie);
    return this.http.patch<JsonMovie>(`${moviesUrl}/${movie.id}`, jsmovie)
    .pipe(
      map(responsemovie => {
          return this._toMovie(responsemovie) 
      })
    );
  }

  delete(movie: Movie): Observable<Movie>{
    return this.http.delete<void>(`${moviesUrl}/${movie.id}`)
    .pipe(
      map(()=>movie)
    );
  }


  // ************* helpers *****************


  private _toJsonMovie(item: Movie): JsonMovie{
    const [hours, minutes] = [item.duration.hours, item.duration.minutes];
    return {
      id: item.id, 
      title: item.title,
      duration: Durations.serialize(item.duration)
    }
  }

  private _toMovie(item: JsonMovie): Movie{
    return {
      id: item.id,
      title: item.title,
      duration: Durations.deserialize(item.duration)
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
