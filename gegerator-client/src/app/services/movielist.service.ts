import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'
import { map, mergeMap, Observable } from 'rxjs';
import { Movie, MovieJSON } from '../models/movie.model';
import { Durations } from '../models/time.utils';


const moviesUrl = "/gegerator/movies"


@Injectable({
  providedIn: 'root'
})
export class MovielistService{

  constructor(private http: HttpClient) {}

  getAll(): Observable<Movie[]>{
    return this.http.get<MovieJSON[]>(moviesUrl)
      .pipe(map(aoMovies => aoMovies.map(Movie.fromJSON))
    )
  }

  save(movie: Movie): Observable<Movie>{
    return this.http.post<MovieJSON>(moviesUrl, movie.toJSON())
      .pipe(map(Movie.fromJSON)
    );
  }

  update(movie: Movie): Observable<Movie>{
    return this.http.patch<MovieJSON>(`${moviesUrl}/${movie.id}`, movie.toJSON())
    .pipe(map(Movie.fromJSON)
    );
  }

  delete(movie: Movie): Observable<Movie>{
    return this.http.delete<void>(`${moviesUrl}/${movie.id}`)
    .pipe(
      map(()=>movie)
    );
  }
}
