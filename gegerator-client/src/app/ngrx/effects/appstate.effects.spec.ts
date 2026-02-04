import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Actions } from '@ngrx/effects'
import { of, throwError, firstValueFrom } from 'rxjs'

import { AppStateEffects } from './appstate.effects'
import { AppStateService } from 'src/app/services/appstate.service'
import { AppStateActions } from '../actions/appstate.actions'
import { GenericPurposeDialog } from 'src/app/components/genericpurposedialog/genericpurposedialog.component'
import { MatDialog } from '@angular/material/dialog'
import { Store } from '@ngrx/store'
import { ConfigurationActions } from '../actions/configuration.actions'
import { MovieActions } from '../actions/movie.actions'
import { SessionActions } from '../actions/session.actions'
import { ActivityActions } from '../actions/activity.actions'
import { AppState } from '../appstate-models/app.state'
import { WizardConfiguration } from '../appstate-models/wizardconfiguration.model'
import { someMovie, someSession, someActivity } from 'src/_testhelpers/factories'

/**
 * Test suite skeleton for AppStateEffects
 *
 * Each test is intentionally left empty and contains a block comment
 * describing the goal, scenario (given/when/then) and desired assertions.
 */

describe('AppStateEffects', () => {
  beforeEach(() => {
    // Synchronous setup placeholder:
    // - prepare TestBed or effect instance
    // - provide mocked AppStateService, MatDialog, Store and Actions stream
  })

  it('should upload file, open info dialog and emit appstate_reloaded', async () => {
    /*
      Goal of the test: verify that when `upload_appstate` is dispatched the
      `upload$` effect calls `AppStateService.upload(file)`, opens an info
      dialog (`GenericPurposeDialog`) with message "Fichier chargé" and
      finally emits `AppStateActions.appstate_reloaded({ appstate })` with the
      returned appstate.

      Synopsis:
      - given: a mock Actions stream emitting `AppStateActions.upload_appstate({file})`,
        a mocked `AppStateService.upload()` returning an observable of an AppState,
        and a mocked `MatDialog.open()` spy
      - when: the effect is subscribed
      - then: the effect emits `appstate_reloaded` with the service result and
        `MatDialog.open` has been called with `GenericPurposeDialog` and
        `data.message === 'Fichier chargé'` and `data.type === 'info'`.

      Desired tests and assertions:
      1. `AppStateService.upload()` called once with the provided `File`
      2. `MatDialog.open()` called once with `GenericPurposeDialog` and the info message
      3. emitted action equals `AppStateActions.appstate_reloaded` and carries the returned `appstate`
    */
    const file = new File(['{}'], 'state.json', { type: 'application/json' })
    const appstate = new AppState(new WizardConfiguration(), [someMovie()], [someSession().toMovieSession()], [someActivity()])

    const serviceMock = { upload: vi.fn(() => of(appstate)) }
    const dialogMock = { open: vi.fn() }
    const actions$ = new Actions(of(AppStateActions.upload_appstate({ file })))

    const storeMock = { dispatch: vi.fn() }

    TestBed.configureTestingModule({
      providers: [
        AppStateEffects,
        { provide: Actions, useValue: actions$ },
        { provide: AppStateService, useValue: serviceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Store, useValue: storeMock }
      ]
    })

    const effects = TestBed.inject(AppStateEffects)
    const emitted = await firstValueFrom(effects.upload$)

    // assert that the file is send to the service
    expect(serviceMock.upload).toHaveBeenCalledWith(file)
    // assert that the dialog is opened with the expected parameters
    expect(dialogMock.open).toHaveBeenCalledTimes(1)
    const [component, config] = dialogMock.open.mock.calls[0]
    expect(component).toBe(GenericPurposeDialog)
    expect(config.data.message).toBe('Fichier chargé')
    expect(config.data.type).toBe('info')
    // assert that the emitted action is as expected
    expect(emitted).toEqual(AppStateActions.appstate_reloaded({ appstate }))
  })

  it('should emit appstate_reloaded when reload_appstate is received', async () => {
    /*
      Goal of the test: ensure `reload$` calls `AppStateService.reload()` and
      emits `AppStateActions.appstate_reloaded({ appstate })`.

      Synopsis:
      - given: Actions emits `AppStateActions.reload_appstate()` and
        `AppStateService.reload()` returns an observable AppState
      - when: the effect runs
      - then: effect emits `appstate_reloaded` with the returned appstate

      Desired tests and assertions:
      1. `AppStateService.reload()` is called once
      2. emitted action equals `AppStateActions.appstate_reloaded` with the returned value
    */
    const appstate = new AppState(new WizardConfiguration(), [someMovie()], [someSession().toMovieSession()], [someActivity()])
    const serviceMock = { reload: vi.fn(() => of(appstate)) }
    const actions$ = new Actions(of(AppStateActions.reload_appstate()))

    const storeMock = { dispatch: vi.fn() }

    TestBed.configureTestingModule({
      providers: [
        AppStateEffects,
        { provide: Actions, useValue: actions$ },
        { provide: AppStateService, useValue: serviceMock },
        { provide: Store, useValue: storeMock }
      ]
    })

    const effects = TestBed.inject(AppStateEffects)
    const emitted = await firstValueFrom(effects.reload$)

    expect(serviceMock.reload).toHaveBeenCalledTimes(1)
    expect(emitted).toEqual(AppStateActions.appstate_reloaded({ appstate }))
  })

  it('should dispatch configuration/movie/session/activity reload actions on appstate_reloaded', async () => {
    /*
      Goal of the test: verify `reloaded$` effect reacts to `appstate_reloaded`
      by dispatching the corresponding store actions for each sub-entity and
      finally returns `AppStateActions.dummy()`.

      Synopsis:
      - given: an `AppState` object containing `wizardConfiguration`, `movies`, `sessions`, `activities`
      - when: Actions emits `AppStateActions.appstate_reloaded({appstate})`
      - then: the effect performs `store.dispatch` for:
         - `ConfigurationActions.wizconf_reloaded({wizconf: state.wizardConfiguration})`
         - `MovieActions.movies_reloaded({movies: state.movies})`
         - `SessionActions.sessions_reloaded({sessions: state.sessions})`
         - `ActivityActions.activities_reloaded({activities: state.activities})`
        and emits `AppStateActions.dummy()`

      Desired tests and assertions:
      1. `store.dispatch` called four times with the expected actions and payloads (in any order or in sequence as implemented)
      2. the effect emits an action whose type equals `AppStateActions.dummy.type`
    */
    const appstate = new AppState(
      new WizardConfiguration(),
      [someMovie()],
      [someSession().toMovieSession()],
      [someActivity()]
    )

    const storeMock = { dispatch: vi.fn() }
    const actions$ = new Actions(of(AppStateActions.appstate_reloaded({ appstate })))

    TestBed.configureTestingModule({
      providers: [
        AppStateEffects,
        { provide: Actions, useValue: actions$ },
        { provide: Store, useValue: storeMock }
      ]
    })

    const effects = TestBed.inject(AppStateEffects)
    const emitted = await firstValueFrom(effects.reloaded$)

    expect(storeMock.dispatch).toHaveBeenCalledTimes(4)
    expect(storeMock.dispatch).toHaveBeenNthCalledWith(1, ConfigurationActions.wizconf_reloaded({ wizconf: appstate.wizardConfiguration }))
    expect(storeMock.dispatch).toHaveBeenNthCalledWith(2, MovieActions.movies_reloaded({ movies: appstate.movies }))
    expect(storeMock.dispatch).toHaveBeenNthCalledWith(3, SessionActions.sessions_reloaded({ sessions: appstate.sessions }))
    expect(storeMock.dispatch).toHaveBeenNthCalledWith(4, ActivityActions.activities_reloaded({ activities: appstate.activities }))

    expect(emitted).toEqual(AppStateActions.dummy())
  })


  it('upload$ should propagate service errors', async () => {
    /*
      Goal: document behavior when `AppStateService.upload()` errors. Since the
      effect has no `catchError`, the error should propagate to the effect stream.

      Synopsis:
      - given: Actions emits `upload_appstate` and `AppStateService.upload()` returns an observable that errors
      - when: the effect is subscribed
      - then: subscribing to the effect results in an error (or the observable rejects)

      Desired tests and assertions:
      1. the effect observable errors when the service errors
      2. optional: the error message matches the service error
    */
    const file = new File(['{}'], 'state.json', { type: 'application/json' })
    const serviceMock = { upload: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(AppStateActions.upload_appstate({ file })))

    const storeMock = { dispatch: vi.fn() }

    TestBed.configureTestingModule({
      providers: [
        AppStateEffects,
        { provide: Actions, useValue: actions$ },
        { provide: AppStateService, useValue: serviceMock },
        { provide: Store, useValue: storeMock }
      ]
    })

    const effects = TestBed.inject(AppStateEffects)

    await expect(firstValueFrom(effects.upload$)).rejects.toThrow('boom')
  })

})
