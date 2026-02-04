import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Actions } from '@ngrx/effects'
import { of, throwError, firstValueFrom } from 'rxjs'

import { ConfigurationEffects } from './configuration.effects'
import { ConfigurationService } from 'src/app/services/configuration.service'
import { ConfigurationActions } from '../actions/configuration.actions'
import { WizardConfiguration } from '../appstate-models/wizardconfiguration.model'

/**
 * Test suite skeleton for ConfigurationEffects
 *
 * Each test is intentionally left empty and contains a block comment
 * describing the goal, scenario (given/when/then) and desired assertions.
 */

describe('ConfigurationEffects', () => {
  beforeEach(() => {
    // Synchronous setup placeholder:
    // - prepare TestBed or effect instance
    // - provide mocked ConfigurationService and Actions stream
  })

  it('should reload wizard configuration and emit wizconf_reloaded', async () => {
    /*
      Goal of the test: verify that when `reload_wizconf` action is dispatched
      the `reload$` effect calls `ConfigurationService.getWizardConfiguration()`
      and emits `ConfigurationActions.wizconf_reloaded({ wizconf })` with the
      returned configuration.

      Synopsis:
      - given: a mock Actions stream emitting `ConfigurationActions.reload_wizconf()`
        and a mocked `ConfigurationService.getWizardConfiguration()` returning an observable of a WizardConfiguration
      - when: the effect is subscribed
      - then: the effect emits `ConfigurationActions.wizconf_reloaded({ wizconf })`

      Desired tests and assertions:
      1. `ConfigurationService.getWizardConfiguration()` is called once
      2. emitted action matches `wizconf_reloaded` with the same configuration
      3. no additional actions are emitted
    */
    const wizconf = new WizardConfiguration()
    const serviceMock = { getWizardConfiguration: vi.fn(() => of(wizconf)) }
    const actions$ = new Actions(of(ConfigurationActions.reload_wizconf()))

    TestBed.configureTestingModule({
      providers: [
        ConfigurationEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ConfigurationService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(ConfigurationEffects)
    const emitted = await firstValueFrom(effects.reload$)

    expect(serviceMock.getWizardConfiguration).toHaveBeenCalledTimes(1)
    expect(emitted).toEqual(ConfigurationActions.wizconf_reloaded({ wizconf }))
  })

  it('should update wizard configuration and emit wizconf_updated', async () => {
    /*
      Goal of the test: ensure `update$` effect calls
      `ConfigurationService.updateWizardConfiguration(wizconf)` with the provided
      configuration and then emits `ConfigurationActions.wizconf_updated({ wizconf })`.

      Synopsis:
      - given: Actions stream emits `ConfigurationActions.update_wizconf({ wizconf })`
        and `ConfigurationService.updateWizardConfiguration()` returns an observable of the updated configuration
      - when: the effect runs
      - then: the effect emits `ConfigurationActions.wizconf_updated({ wizconf })`

      Desired tests and assertions:
      1. `ConfigurationService.updateWizardConfiguration()` is called with the input wizconf
      2. emitted action is `wizconf_updated` containing the returned wizconf
    */
    const wizconf = new WizardConfiguration()
    const serviceMock = { updateWizardConfiguration: vi.fn(() => of(wizconf)) }
    const actions$ = new Actions(of(ConfigurationActions.update_wizconf({ wizconf })))

    TestBed.configureTestingModule({
      providers: [
        ConfigurationEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ConfigurationService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(ConfigurationEffects)
    const emitted = await firstValueFrom(effects.update$)

    expect(serviceMock.updateWizardConfiguration).toHaveBeenCalledWith(wizconf)
    expect(emitted).toEqual(ConfigurationActions.wizconf_updated({ wizconf }))
  })

  it('should propagate service errors for reload$', async () => {
    /*
      Goal: document behavior when `ConfigurationService.getWizardConfiguration()` errors.
      Since the effect has no catchError, the error should propagate to the effect stream.

      Synopsis:
      - given: Actions emits `reload_wizconf` and service method returns an observable that errors
      - when: the effect is subscribed
      - then: the effect stream should error (or the observable rejects)

      Desired tests and assertions:
      1. subscribing to `reload$` leads to an error emission
      2. optional: the error message matches the service error
    */
    const serviceMock = { getWizardConfiguration: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(ConfigurationActions.reload_wizconf()))

    TestBed.configureTestingModule({
      providers: [
        ConfigurationEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ConfigurationService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(ConfigurationEffects)

    await expect(firstValueFrom(effects.reload$)).rejects.toThrow('boom')
  })

  it('should propagate service errors for update$', async () => {
    /*
      Goal: document behavior when `ConfigurationService.updateWizardConfiguration()` errors.

      Synopsis:
      - given: Actions emits `update_wizconf` and service method returns an observable that errors
      - when: the effect is subscribed
      - then: the effect stream should error (or the observable rejects)

      Desired tests and assertions:
      1. subscribing to `update$` leads to an error emission
      2. optional: the error message matches the service error
    */
    const wizconf = new WizardConfiguration()
    const serviceMock = { updateWizardConfiguration: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(ConfigurationActions.update_wizconf({ wizconf })))

    TestBed.configureTestingModule({
      providers: [
        ConfigurationEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ConfigurationService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(ConfigurationEffects)

    await expect(firstValueFrom(effects.update$)).rejects.toThrow('boom')
  })

})
