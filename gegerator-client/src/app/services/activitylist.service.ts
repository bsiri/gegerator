import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OtherActivity } from '../models/activity.model';
import { Days } from '../models/referential.data';
import { Times } from '../models/time.utils';

const activitiesUrl = '/gegerator/other-activities'

@Injectable({
  providedIn: 'root'
})
export class ActivitylistService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<OtherActivity[]>{
    return this.http.get<JsonOtherActivity[]>(activitiesUrl)
      .pipe(
        map(allactivities => {
          return allactivities.map(a => this._toOtherActivity(a));
        })
    );
  }

  save(activity: OtherActivity): Observable<OtherActivity>{
    const jsactivity = this._toJsonOtherActivity(activity);
    return this.http.post<JsonOtherActivity>(activitiesUrl, jsactivity)
      .pipe(
        map(responseactivity =>{
          return this._toOtherActivity(responseactivity)
        })
    );
  }

  update(activity: OtherActivity): Observable<OtherActivity>{
    const jsactivity = this._toJsonOtherActivity(activity);
    return this.http.patch<JsonOtherActivity>(`${activitiesUrl}/${activity.id}`, jsactivity)
      .pipe(
        map(responseactivity => {
          return this._toOtherActivity(responseactivity)
        })
    );
  }

  delete(activity: OtherActivity): Observable<OtherActivity>{
    return this.http.delete<void>(`${activitiesUrl}/${activity.id}`)
      .pipe(
        map(() => activity)
    )
  }

  // ************* helpers *****************

  private _toJsonOtherActivity(item: OtherActivity): JsonOtherActivity{
    return {
      id: item.id,
      day: item.day.key,
      startTime: Times.serialize(item.startTime),
      endTime: Times.serialize(item.endTime),
      description: item.description
    }
  }

  private _toOtherActivity(item: JsonOtherActivity): OtherActivity{
    return {
      id: item.id,
      day: Days.fromKey(item.day),
      startTime: Times.deserialize(item.startTime),
      endTime: Times.deserialize(item.endTime),
      description: item.description
    }
  }

}

class JsonOtherActivity{
  constructor(
    public id: number, 
    public day: string, 
    public startTime: string,
    public endTime: string,
    public description: string
  ){}
}


