import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AppState, AppStateJSON } from '../ngrx/appstate-models/app.state';

const stateUrl = './api/app-state'

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<AppState>{
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AppStateJSON>(stateUrl, formData)
    .pipe(
      //tap(something => console.log(something)),
      map(AppState.fromJSON)
    )
  }

  reload(): Observable<AppState>{
    return this.http.get<AppStateJSON>(stateUrl)
      .pipe(map(AppState.fromJSON))
  }

}
