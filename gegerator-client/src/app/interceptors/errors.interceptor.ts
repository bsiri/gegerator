import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import { catchError, EMPTY, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GenericPurposeDialog } from '../components/genericpurposedialog/genericpurposedialog.component';


const PRECONDITION_FAILED = 412

@Injectable()
export class ErrorsInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog){

  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            catchError( (httpError: HttpErrorResponse) => {
                console.log('got an error here, ',httpError)

                if (httpError.status == PRECONDITION_FAILED ){
                  this.openBusinessErrorDialog(httpError)
                }
                else if (httpError.status >= 500){
                  this.openServerErrorDialog(httpError)
                }
                else{
                  // TODO: better for other exceptions?
                  this.openBusinessErrorDialog(httpError.error)
                }

                return EMPTY
            })
        )
  }

  openBusinessErrorDialog(error: HttpErrorResponse){
    this._openDialog(error.error || error.message)
  }

  openServerErrorDialog(error: HttpErrorResponse){
      const html = `${error.error || error.message} <br/> Ce n'est pas normal, veuillez contacter le mainteneur de cette appli en carton.`
      this._openDialog(html)
  }

  _openDialog(message: string){
    this.dialog.open(GenericPurposeDialog, {
      data: {html: message, type: "error"}
    });
  }
}
