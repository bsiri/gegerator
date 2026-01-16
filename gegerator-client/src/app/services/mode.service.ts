import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mode } from '../ngrx/appstate-models/mode.model';

@Injectable({
  providedIn: 'root'
})
export class ModeService {

  // private updatable signal, don't listen to it
  private _$mode = signal(Mode.MANUAL)

  // this is the public signal you want to listen to
  public $mode = this._$mode.asReadonly()

  constructor() { }

  /**
   * Switches the mode between manual or wizard, 
   * depending on the current state.
   */
  switchMode(){
    if (this.$mode() == Mode.MANUAL){
      this._$mode.set(Mode.WIZARD)
    }
    else{
      this._$mode.set(Mode.MANUAL)
    }
  }

}
