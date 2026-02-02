import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { map, Observable } from 'rxjs';
import { Movie, MovieJSON } from '../models/movie.model';

const moviesUrl = "./api/movies"

@Injectable({
  providedIn: 'root'
})
export class MovielistService{
  private http = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);


  constructor() {}

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
