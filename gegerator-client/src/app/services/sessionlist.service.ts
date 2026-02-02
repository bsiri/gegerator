import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MovieSession, MovieSessionJSON } from '../models/session.model';

const sessionsUrl = "./api/movie-sessions"

@Injectable({
  providedIn: 'root'
})
export class SessionlistService {
  private http = inject(HttpClient);

  getAll(): Observable<MovieSession[]>{
    return this.http.get<MovieSessionJSON[]>(sessionsUrl)
      .pipe(map(aoSessions => aoSessions.map(MovieSession.fromJson))
    );
  }

  save(session: MovieSession): Observable<MovieSession>{
    return this.http.post<MovieSessionJSON>(sessionsUrl, session.toJSON())
      .pipe(map(MovieSession.fromJson)
    );
  }

  update(session: MovieSession): Observable<MovieSession>{
    return this.http.patch<MovieSessionJSON>(`${sessionsUrl}/${session.id}`, session)
      .pipe(map(MovieSession.fromJson)
    );
  }

  delete(session: MovieSession): Observable<MovieSession>{
    return this.http.delete<void>(`${sessionsUrl}/${session.id}`)
      .pipe(
        map(() => session)
    )
  }
}
