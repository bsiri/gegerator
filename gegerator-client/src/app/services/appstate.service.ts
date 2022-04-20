import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const stateUrl = '/gegerator/app-state'

@Injectable({
  providedIn: 'root'
})
export class AppstateService {
  
  constructor(private http: HttpClient) { }

  downloadAppState(){
  }

}
