import { describe, it, beforeEach, expect } from 'vitest'
import { TimePipe } from './time.pipe'
import { Time } from 'src/app/models/time.model'
import { Times } from 'src/app/models/time.utils'

describe('TimePipe', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('formats a Time instance to human string', async () => {
    /*
      Goal: verify `TimePipe.transform()` delegates to `Times.toString` and formats correctly.

      Synopsis:
      - given: Time { hours: 9, minutes: 5 }
      - when: calling new TimePipe().transform(time)
      - then: returned string equals `Times.toString(time)` (e.g. '09h05')

      Desired assertions:
      1. returned equals Times.toString(time)
      2. returned is a non-empty string
    */
    const pipe = new TimePipe()
    const time = new Time(9, 5)
    const res = pipe.transform(time)
    expect(res).toBe("09h05")
  })

  it('handles null/undefined input gracefully', async () => {
    /*
      Goal: ensure the pipe does not throw and returns an empty string for empty inputs.

      Synopsis:
      - given: null and undefined inputs
      - when: transform is called
      - then: returns '' and no exception is thrown

      Desired assertions:
      1. transform(null) === ''
      2. transform(undefined) === ''
    */
    const pipe = new TimePipe()
    expect((pipe.transform as any)(null)).toBe('')
    expect((pipe.transform as any)(undefined)).toBe('')
  })

})
