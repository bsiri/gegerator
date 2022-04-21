import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OtherActivity, OtherActivityJSON } from '../models/activity.model';

const activitiesUrl = '/gegerator/other-activities'

@Injectable({
  providedIn: 'root'
})
export class ActivitylistService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<OtherActivity[]>{
    return this.http.get<OtherActivityJSON[]>(activitiesUrl)
      .pipe(map(aoActs => aoActs.map(OtherActivity.fromJSON) ))
  }

  save(activity: OtherActivity): Observable<OtherActivity>{
    return this.http.post<OtherActivityJSON>(activitiesUrl, activity.toJSON())
      .pipe(map(OtherActivity.fromJSON))
  }

  update(activity: OtherActivity): Observable<OtherActivity>{
    return this.http.patch<OtherActivityJSON>(`${activitiesUrl}/${activity.id}`, activity.toJSON())
      .pipe(map(OtherActivity.fromJSON))
  }

  delete(activity: OtherActivity): Observable<OtherActivity>{
    return this.http.delete<void>(`${activitiesUrl}/${activity.id}`)
      .pipe(
        map(() => activity)
    )
  }
}