import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mode } from '../ngrx/appstate-models/mode.model';

@Injectable({
  providedIn: 'root'
})
export class ModeService {

  // private updatable signal, don't listen to it
  private _s_mode = signal(Mode.MANUAL)

  // this is the public signal you want to listen to
  public s_mode = this._s_mode.asReadonly()

  constructor() { }

  /**
   * Switches the mode between manual or wizard, 
   * depending on the current state.
   */
  switchMode(){
    if (this.s_mode() == Mode.MANUAL){
      this._s_mode.set(Mode.WIZARD)
    }
    else{
      this._s_mode.set(Mode.MANUAL)
    }
  }

}
