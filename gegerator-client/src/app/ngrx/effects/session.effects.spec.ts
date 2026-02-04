import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Actions } from '@ngrx/effects'
import { of, throwError, firstValueFrom } from 'rxjs'

import { MovieSessionEffects } from './session.effects'
import { SessionlistService } from 'src/app/services/sessionlist.service'
import { SessionActions } from '../actions/session.actions'
import { someSession } from 'src/_testhelpers/factories'

/**
 * Test suite skeleton for MovieSessionEffects
 *
 * Each test remains empty and contains a block comment describing the
 * goal, scenario (given/when/then) and desired assertions to implement.
 */

describe('MovieSessionEffects', () => {
  beforeEach(() => {
    // Synchronous setup placeholder:
    // - prepare TestBed or effect instance
    // - provide mocked SessionlistService and Actions stream
  })

  it('should reload sessions and emit sessions_reloaded', async () => {
    /*
      Goal: `reload$` should call `SessionlistService.getAll()` and emit
      `SessionActions.sessions_reloaded({sessions})`.

      Synopsis:
      - given: Actions emits `SessionActions.reload_sessions()` and
        `SessionlistService.getAll()` returns sessions
      - when: effect is subscribed
      - then: emitted `sessions_reloaded` with returned sessions

      Desired assertions:
      1. `getAll()` called once
      2. emitted action equals `sessions_reloaded` with returned sessions
    */
    const sessions = [someSession().toMovieSession(), someSession().toMovieSession()]
    const serviceMock = { getAll: vi.fn(() => of(sessions)) }
    const actions$ = new Actions(of(SessionActions.reload_sessions()))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)
    const emitted = await firstValueFrom(effects.reload$)

    expect(serviceMock.getAll).toHaveBeenCalledTimes(1)
    expect(emitted).toEqual(SessionActions.sessions_reloaded({ sessions }))
  })

  it('should create a session and emit session_created', async () => {
    /*
      Goal: `create$` should call `SessionlistService.save(session)` and emit
      `SessionActions.session_created({session})` with the saved session.

      Synopsis:
      - given: Actions emits `SessionActions.create_session({ session })` and
        service.save() returns created session
      - when: effect runs
      - then: emitted `session_created` with returned session

      Desired assertions:
      1. `save()` called with provided session
      2. emitted `session_created` contains returned session
    
      Note: SessionlistService.save() do not actually create anything; it just
      sends the provided to the backend server and returns the same session echoed
      back. Therefore, the returned session is expected to be identical to the
      input session.
    */
    const input = someSession().toMovieSession()
    const serviceMock = { save: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(SessionActions.create_session({ session: input })))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)
    const emitted = await firstValueFrom(effects.create$)

    expect(serviceMock.save).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(SessionActions.session_created({ session: input }))
  })

  it('should update a session and emit session_updated when thenReload is false', async () => {
    /*
      Goal: `update$` should call `SessionlistService.update(session)` and,
      when `action.thenReload` is false or absent, emit
      `SessionActions.session_updated({session})`.

      Synopsis:
      - given: Actions emits `SessionActions.update_session({ session, thenReload: false })`
        and service.update() returns the updated session
      - when: effect runs
      - then: emitted `session_updated` with returned session

      Desired assertions:
      1. `update()` called with provided session
      2. emitted `session_updated` contains returned session

      Note: SessionlistService.update() do not actually create anything; it just
      sends the provided to the backend server and returns the same session echoed
      back. Therefore, the returned session is expected to be identical to the
      input session.

    */
    const input = someSession().toMovieSession()
    const serviceMock = { update: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(SessionActions.update_session({ session: input, thenReload: false })))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)
    const emitted = await firstValueFrom(effects.update$)

    expect(serviceMock.update).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(SessionActions.session_updated({ session: input }))
  })

  it('should update a session and emit reload_sessions when thenReload is true', async () => {
    /*
      Goal: when `action.thenReload` is true, `update$` should return
      `SessionActions.reload_sessions()` instead of `session_updated`.

      Synopsis:
      - given: Actions emits `SessionActions.update_session({ session, thenReload: true })`
        and service.update() returns a value
      - when: effect runs
      - then: emitted action equals `SessionActions.reload_sessions()`

      Desired assertions:
      1. `update()` called with provided session
      2. emitted action equals `reload_sessions()`

      Note: SessionlistService.update() do not actually create anything; it just
      sends the provided to the backend server and returns the same session echoed
      back. Therefore, the returned session is expected to be identical to the
      input session.
    */
    const input = someSession().toMovieSession()
    const serviceMock = { update: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(SessionActions.update_session({ session: input, thenReload: true })))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)
    const emitted = await firstValueFrom(effects.update$)

    expect(serviceMock.update).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(SessionActions.reload_sessions())
  })

  it('should delete a session and emit session_deleted', async () => {
    /*
      Goal: `delete$` should call `SessionlistService.delete(session)` and emit
      `SessionActions.session_deleted({session})` with the deleted session.

      Synopsis:
      - given: Actions emits `SessionActions.delete_session({ session })` and service.delete() returns session
      - when: effect runs
      - then: emitted `session_deleted` with returned session

      Desired assertions:
      1. `delete()` called with provided session
      2. emitted `session_deleted` contains returned session
    */
    const input = someSession().toMovieSession()
    const serviceMock = { delete: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(SessionActions.delete_session({ session: input })))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)
    const emitted = await firstValueFrom(effects.delete$)

    expect(serviceMock.delete).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(SessionActions.session_deleted({ session: input }))
  })

  it('should propagate service errors for session effects', async () => {
    /*
      Goal: document behavior when SessionlistService methods error. Effects
      currently do not catch errors; they should propagate to the effect stream.

      Synopsis:
      - given: actions emit and service methods throw errors
      - when: effect subscribed
      - then: observable errors

      Desired assertions:
      1. subscribing to the effect when service errors results in an error
    */
    const serviceMock = { getAll: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(SessionActions.reload_sessions()))

    TestBed.configureTestingModule({
      providers: [
        MovieSessionEffects,
        { provide: Actions, useValue: actions$ },
        { provide: SessionlistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieSessionEffects)

    await expect(firstValueFrom(effects.reload$)).rejects.toThrow('boom')
  })
})
