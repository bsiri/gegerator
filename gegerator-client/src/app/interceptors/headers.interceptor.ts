import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    const headersReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json')
                          .set('Accept', 'application/json')

    });

    return next.handle(headersReq);

  }
}