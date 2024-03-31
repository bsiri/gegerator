import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlannableEvent } from '../models/plannable.model';
import { FestivalRoadmap, RoadmapData } from '../models/roadmap.model';
import { MovieSessionJSON } from '../models/session.model';
import { WizardRoadmapActions } from '../ngrx/actions/wizard-roadmap.actions';

const wizardroadmapUrl = "./api/wizard/roadmap"

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
    this.source = this.initEventSource()
  }

  initEventSource(){
    const source = new EventSource(wizardroadmapUrl)
    source.onopen = () => { console.log('SSE socket connected') }
    source.onmessage = (msg) => {
      const rdata = toRoadmapData(JSON.parse(msg.data))
      this._zone.run(() => {
        this.store.dispatch(WizardRoadmapActions.wizardroadmap_reloaded(rdata))
      })
    }

    // on error, log and retry a few moments later
    source.onerror = (msg) => {
      this.source.close()
      this._zone.run(() => {
          console.log(`Error with SSE socket (${msg}). Retrying ...`)
      })
      setTimeout(() => {
        this.source = this.initEventSource()
      }, 10000)
    }

    return source
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
