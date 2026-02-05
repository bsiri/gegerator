import { describe, it, beforeEach, expect, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { HttpErrorResponse, HttpRequest, HttpHandler } from '@angular/common/http'
import { throwError, of } from 'rxjs'

import { ErrorsInterceptor } from './errors.interceptor'
import { GenericPurposeDialog } from '../components/genericpurposedialog/genericpurposedialog.component'

describe('ErrorsInterceptor', () => {
  let interceptor: ErrorsInterceptor
  let dialogMock: { open: any }

  beforeEach(() => {
    dialogMock = { open: vi.fn() }

    TestBed.configureTestingModule({
      providers: [
        ErrorsInterceptor,
        { provide: MatDialog, useValue: dialogMock }
      ]
    })

    interceptor = TestBed.inject(ErrorsInterceptor)
  })


  it('should open business error dialog when status is 412 (PRECONDITION_FAILED)', async () => {
    /*
      Goal of the test: verify intercept handles 412 responses by opening a business error dialog.

      Synopsis:
      - given: an HttpErrorResponse with status 412 and a message/body
      - when: intercept is invoked with an observable that errors with that response
      - then: the interceptor calls the dialog-opening path for business errors and returns EMPTY

      Desired tests and assertions:
      1. the method that opens a business error dialog is called once
      2. MatDialog.open is invoked with GenericPurposeDialog and data.type === 'error'
      3. the returned observable completes without emitting values
    */

    const err = new HttpErrorResponse({ status: 412, error: 'business problem', statusText: 'Precondition' })
    const handler: HttpHandler = { handle: () => throwError(() => err) } as any
    const req = new HttpRequest('GET', '/test')

    let nextCalled = false
    let errorCalled = false
    let completeCalled = false

    interceptor.intercept(req, handler).subscribe({
      next: () => (nextCalled = true),
      error: () => (errorCalled = true),
      complete: () => (completeCalled = true)
    })

    expect(nextCalled).toBe(false)
    expect(errorCalled).toBe(false)
    expect(completeCalled).toBe(true)

    expect(dialogMock.open).toHaveBeenCalledTimes(1)
    const [component, config] = dialogMock.open.mock.calls[0]
    expect(component).toBe(GenericPurposeDialog)
    expect(config.data.type).toBe('error')
    expect(config.data.html).toBe('business problem')
  })

  it('should open server error dialog when status is >= 500 (INTERNAL_SERVER_ERROR)', async () => {
    /*
      Goal of the test: verify intercept handles 5xx responses by opening a server error dialog.

      Synopsis:
      - given: an HttpErrorResponse with status 500 and an error message
      - when: intercept is invoked and the handler errors with that response
      - then: interceptor opens server error dialog containing the original message + maintenance sentence

      Desired tests and assertions:
      1. the method that opens server error dialog is called once
      2. MatDialog.open is invoked with GenericPurposeDialog and data.html includes the original message and the french sentence
      3. the returned observable completes without emitting values
    */

    const err = new HttpErrorResponse({ status: 500, error: 'boom', statusText: 'Server Error' })
    const handler: HttpHandler = { handle: () => throwError(() => err) } as any
    const req = new HttpRequest('GET', '/server')

    let completeCalled = false
    interceptor.intercept(req, handler).subscribe({ complete: () => (completeCalled = true) })

    expect(completeCalled).toBe(true)
    expect(dialogMock.open).toHaveBeenCalledTimes(1)
    const config = dialogMock.open.mock.calls[0][1]
    expect(config.data.type).toBe('error')
    expect(config.data.html).toContain('boom')
    expect(config.data.html).toContain("Ce n'est pas normal, veuillez contacter le mainteneur")
  })

  it('should open business error dialog for other non-server errors (non-412)', async () => {
    /*
      Goal of the test: ensure the interceptor treats other client errors as business errors.

      Synopsis:
      - given: an HttpErrorResponse with status 400 and an `error` payload
      - when: intercept receives that error
      - then: interceptor calls the business error dialog path

      Notes: The current implementation passes `httpError.error` into openBusinessErrorDialog.
      If `httpError.error` is a primitive (string) this may lead to unexpected displayed message.

      Desired tests and assertions:
      1. business error dialog method is called
      2. MatDialog.open receives the expected value (or the test documents the current problematic behaviour)
      3. the returned observable completes without emitting values
    */

    const body = { message: 'bad request details' }
    const err = new HttpErrorResponse({ status: 400, error: body, statusText: 'Bad Request' })
    const handler: HttpHandler = { handle: () => throwError(() => err) } as any
    const req = new HttpRequest('GET', '/create')

    let completeCalled = false
    interceptor.intercept(req, handler).subscribe({ complete: () => (completeCalled = true) })

    expect(completeCalled).toBe(true)
    expect(dialogMock.open).toHaveBeenCalledTimes(1)
    const config = dialogMock.open.mock.calls[0][1]
    expect(config.data.type).toBe('error')
    expect(config.data.html).toBe(body.message)
  })

  it('should not open any dialog for successful requests (200)', async () => {
    /*
      Goal: ensure interceptor forwards successful responses and does not open dialogs.

      - given: a handler that emits a successful value
      - when: intercept is called
      - then: MatDialog.open is not called and the value is forwarded
    */

    const handler: HttpHandler = { handle: () => of({ ok: true }) } as any
    const req = new HttpRequest('GET', '/ok')

    let nextValue: any = null
    let complete = false

    interceptor.intercept(req, handler).subscribe({
      next: (v: any) => (nextValue = v),
      complete: () => (complete = true)
    })

    expect(nextValue).toEqual({ ok: true })
    expect(complete).toBe(true)
    expect(dialogMock.open).toHaveBeenCalledTimes(0)
  })


  // Test data / mocks
  const makeHttpErrorResponse = (status: number, error: any, message = 'error') => {
    return new HttpErrorResponse({ status, error, statusText: message })
  }
})
