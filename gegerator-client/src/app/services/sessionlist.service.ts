import { Time } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Days, Theaters } from '../models/referential.data';
import { MovieSession } from '../models/session.model';
import { Times } from '../models/time.utils';

const sessionsUrl = "/gegerator/movie-sessions"

@Injectable({
  providedIn: 'root'
})
export class SessionlistService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<MovieSession[]>{
    return this.http.get<JsonMovieSession[]>(sessionsUrl)
      .pipe(
        map(allSessions => {
          return allSessions.map(s => this._toMovieSession(s));
        })
    );
  }

  save(session: MovieSession): Observable<MovieSession>{
    const jsSession = this._toJsonMovieSession(session);
    return this.http.post<JsonMovieSession>(sessionsUrl, jsSession)
      .pipe(
        map(responsesession =>{
          return this._toMovieSession(responsesession)
        })
    );
  }

  update(session: MovieSession): Observable<MovieSession>{
    const jsSession = this._toJsonMovieSession(session);
    return this.http.patch<JsonMovieSession>(`${sessionsUrl}/${session.id}`, jsSession)
      .pipe(
        map(responsesession => {
          return this._toMovieSession(responsesession)
        })
    );
  }

  delete(session: MovieSession): Observable<MovieSession>{
    return this.http.delete<void>(`${sessionsUrl}/${session.id}`)
      .pipe(
        map(() => session)
    )
  }

  // ************* helpers *****************

  private _toJsonMovieSession(item: MovieSession): JsonMovieSession{
    return {
      id: item.id,
      movieId: item.movieId,
      theater: item.theater.key,
      day: item.day.key,
      startTime: Times.serialize(item.startTime)
    }
  }

  private _toMovieSession(item: JsonMovieSession): MovieSession{
    return {
      id: item.id,
      movieId: item.movieId,
      theater: Theaters.fromKey(item.theater),
      day: Days.fromKey(item.day),
      startTime: Times.deserialize(item.startTime)
    }
  }

}

class JsonMovieSession{
  constructor(
    public id: number, 
    public movieId: number,
    public theater: string,
    public day: string, 
    public startTime: string
  ){}
}


