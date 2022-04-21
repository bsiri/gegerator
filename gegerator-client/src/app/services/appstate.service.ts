import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppState, AppStateJSON } from '../ngrx/state/app.state';

const stateUrl = '/gegerator/app-state'

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  
  constructor(private http: HttpClient) { }

  upload(file: File): Observable<AppState>{
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AppState>(stateUrl, formData)
  }

  reload(): Observable<AppState>{
    return this.http.get<AppStateJSON>(stateUrl)
      .pipe(map(AppState.fromJSON))
  }

}
