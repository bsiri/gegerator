import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mode } from '../models/mode.model';

@Injectable({
  providedIn: 'root'
})
export class ModeService {

  private _mode = Mode.MANUAL
  public mode$ = new BehaviorSubject<Mode>(this._mode)

  constructor() { }

  /**
   * Switches the mode between manual or wizard, 
   * depending on the current state.
   */
  switchMode(){
    if (this._mode == Mode.MANUAL){
      this._mode = Mode.WIZARD
    }
    else{
      this._mode = Mode.MANUAL
    }
    this.mode$.next(this._mode)
  }

}
