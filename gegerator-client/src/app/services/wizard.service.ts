import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlannableEvent } from '../models/plannable.model';
import { FestivalRoadmap, RoadmapData } from '../models/roadmap.model';
import { MovieSessionJSON } from '../models/session.model';
import { WizardRoadmapActions } from '../ngrx/actions/wizard-roadmap.actions';

const wizardroadmapUrl = "/gegerator/wizard/roadmap"

/*
  Sorry, here the code is dirty. 
  NGRX imposes that selectors 
*/
@Injectable({
  providedIn: 'root'
})
export class WizardService {

  private source: EventSource


  constructor(
    private _zone: NgZone,
    private store: Store
  ){
    this.source = new EventSource(wizardroadmapUrl)
    this.source.onmessage = (msg) => {
      const rdata = toRoadmapData(JSON.parse(msg.data))
      this._zone.run(() => {
        this.store.dispatch(WizardRoadmapActions.wizardroadmap_reloaded(rdata))
      })
    }
    this.source.onerror = (msg) => {
      this._zone.run(() => {
          console.log(`Error with the wizard roadmap sse : ${msg}`)
      })
    }
  }
}

function toRoadmapData(data: Array<any>): RoadmapData{
  const sessionIds: number[] = []
  const activityIds: number[] = []
  data.forEach(evt => isMovieSession(evt) ? sessionIds.push(evt.id) : activityIds.push(evt.id))
  return {sessionIds, activityIds}
}

function isMovieSession(obj: any): obj is MovieSessionJSON{
  return 'movieId' in obj
} 
