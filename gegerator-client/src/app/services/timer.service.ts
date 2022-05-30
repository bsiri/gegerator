import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber, TeardownLogic } from 'rxjs';


const timerurl = 'http://localhost:4200/gegerator/timer'

const KEEPALIVE_DURATION = 10000

/*
  TODO : discard what I've figured out what's going on
*/
@Injectable({
  providedIn: 'root'
})
export class TimerService {

  public timer$: Observable<number>

  /*
    Because we deal with an event stream (it never completes), 
    we must shield us against things like browser closing.
    
    We do so by setting a timeout which will close the stream
    automatically, unless a prominent feature of the application is 
    still visible in the document, see _restartTimeout
  */
  private source: EventSource

  constructor(
    private http: HttpClient,
    private _zone: NgZone
  ) { 
    this.source = new EventSource(timerurl);

    this.timer$ = new Observable(subscriber => {
      this.source.onmessage = (msg) => {
        this._zone.run(() => {
          subscriber.next(msg.data)
        })
      }
      this.source.onerror = (msg) => {
        this._zone.run(() => {
          console.log(msg)
          subscriber.error("Error with the SSE service !")
        })
      }
    })

    this._restartTimeout()

  }


  /*
  Note : somehow it doesn't work when serving the app via the npm proxy 
  but I think it will work when the app will be served by the actual server.

  Perhaps it is even useless then, I'll need to try. It might be linked to :
  https://github.com/chimurai/http-proxy-middleware/issues/678
  */
  private _restartTimeout(): void{
    setTimeout(() =>{
      const is_alive = (!!document.querySelector('#app-mainview'))
      if (! is_alive){
        this.source.close()
      }
      else{
        this._restartTimeout()
      }
    }, KEEPALIVE_DURATION)
  }

}

