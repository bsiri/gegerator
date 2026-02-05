import { beforeEach, describe, it, expect } from 'vitest'
import { configurationReducer } from './configuration.reducer'
import { ConfigurationActions } from '../actions/configuration.actions'
import { WizardConfiguration } from 'src/app/ngrx/appstate-models/wizardconfiguration.model'

/**
 * Test suite skeleton for configuration reducer
 */

describe('configurationReducer', () => {
  beforeEach(() => {
    // Synchronous setup placeholder
  })

  it('should replace configuration on wizconf_reloaded', async () => {
    /*
      Goal: ensure `wizconf_reloaded` replaces the current configuration object.

      Synopsis:
      - given: a current configuration and an action with a new WizardConfiguration
      - when: reducer is invoked
      - then: returned value equals the payload (object equality)

      Desired assertions:
      1. returned object equals the provided payload
      2. original reference is not reused (immutable replace)
    */
    const current = new WizardConfiguration()
    const next = current.copy({ movieVsTheaterBias: 0.9 })
    const action = ConfigurationActions.wizconf_reloaded({ wizconf: next })

    const res = configurationReducer(current, action)

    expect(res).toBe(next)
    expect(res).not.toBe(current)
  })

  it('should update configuration on wizconf_updated', async () => {
    /*
      Goal: ensure `wizconf_updated` returns the new configuration provided by action.

      Notes: the reducer is a simple replacement — test that the returned object
      matches the payload and that copying behavior is correct when using `copy()`.
    */
    const current = new WizardConfiguration()
    const updated = current.copy({ movieVsTheaterBias: 0.1 })
    const action = ConfigurationActions.wizconf_updated({ wizconf: updated })

    const res = configurationReducer(current, action)

    expect(res).toBe(updated)
    expect(res.movieVsTheaterBias).toBe(0.1)
  })

})
