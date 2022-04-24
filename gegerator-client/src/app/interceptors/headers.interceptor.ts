import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    const newReq = req.clone()
    this.addHeaderIfMissing(newReq, {'Content-Type': 'application/json', 'Accept': 'application/json'})
    return next.handle(newReq)

  }

  private addHeaderIfMissing(newReq: HttpRequest<any>, headers: {[key: string]: string}){
    for (let key of Object.keys(headers)){
      if (! newReq.headers.has(key)){
        newReq.headers.set(key, headers[key])
      }
    }
  }
}