import { describe, it, beforeEach, expect, vi } from 'vitest'
import { DurationPipe } from './duration.pipe'
import { Duration } from 'iso8601-duration'
import { Durations } from 'src/app/models/time.utils'

describe('DurationPipe', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('transforms a standard duration to human string', async () => {
    /*
      Goal: verify `DurationPipe.transform()` returns the human readable
      representation for a typical duration value.

      Synopsis:
      - given: a Duration object like { hours: 1, minutes: 30 }
      - when: calling `new DurationPipe().transform(duration)`
      - then: it returns the string produced by `Durations.toString(duration)`,
        e.g. '1h30'

      Desired assertions:
      1. returned is a non-empty string
      2. returned equals expected string (exact match)
    */
    const pipe = new DurationPipe()
    const dur: Duration = { hours: 1, minutes: 30 }
    const res = pipe.transform(dur)
    expect(res).toBe(Durations.toString(dur))
  })

  it('returns empty string for null or undefined input', async () => {
    /*
      Goal: ensure the pipe gracefully handles missing inputs.

      Synopsis:
      - given: `null` and `undefined` as input values
      - when: calling `transform` for each
      - then: the result is an empty string (no exceptions)

      Desired assertions:
      1. `transform(null)` returns ''
      2. `transform(undefined)` returns ''
    */
    const pipe = new DurationPipe()
    expect((pipe.transform as any)(null)).toBe('')
    expect((pipe.transform as any)(undefined)).toBe('')
  })

  it('pads minutes with leading zero when necessary', async () => {
    /*
      Goal: ensure minute values are two-digits in the output.

      Synopsis:
      - given: Duration { hours: 0, minutes: 5 } and { hours: 2, minutes: 7 }
      - when: transform is called
      - then: outputs are '0h05' and '2h07' respectively

      Desired assertions:
      1. returned strings have two-digit minutes
    */
    const pipe = new DurationPipe()
    const d1: Duration = { hours: 0, minutes: 5 }
    const d2: Duration = { hours: 2, minutes: 7 }

    expect(pipe.transform(d1)).toBe('0h05')
    expect(pipe.transform(d2)).toBe('2h07')
  })

})
