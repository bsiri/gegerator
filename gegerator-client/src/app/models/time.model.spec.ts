import { describe, it, beforeEach, expect } from 'vitest';
import { Duration } from 'iso8601-duration';
import { Time, TimeInterval } from './time.model';


describe('Time model', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('should convert time to total minutes', async () => {
    /*
      Goal: verify `toMinutes()` returns hours*60 + minutes.

      Synopsis:
      - given: several Time instances (e.g. 0h00, 1h30, 10h05)
      - when: calling `toMinutes()`
      - then: returns the expected integer number of minutes.

      Desired assertions:
      1. `new Time(0,0).toMinutes()` === 0
      2. `new Time(1,30).toMinutes()` === 90
      3. `new Time(10,5).toMinutes()` === 605
    */
    expect(new Time(0,0).toMinutes()).toBe(0)
    expect(new Time(1,30).toMinutes()).toBe(90)
    expect(new Time(10,5).toMinutes()).toBe(605)
  })

  it('should compare times correctly', async () => {
    /*
      Goal: verify `compare()` returns the difference in minutes.

      Synopsis:
      - given: two Time instances T1 and T2
      - when: calling `T1.compare(T2)`
      - then: result equals T1.toMinutes() - T2.toMinutes()

      Desired assertions:
      1. compare returns positive when first is later
      2. returns negative when first is earlier
      3. returns 0 when equal
    */
    const t1 = new Time(12, 15)
    const t2 = new Time(11, 0)
    expect(t1.compare(t2)).toBe(t1.toMinutes() - t2.toMinutes())
    expect(t1.compare(t2)).toBeGreaterThan(0)

    const t3 = new Time(8, 0)
    expect(t3.compare(t2)).toBeLessThan(0)

    const t4 = new Time(11, 0)
    expect(t4.compare(t2)).toBe(0)
  })

  it('isBefore should be inclusive and correct', async () => {
    /*
      Goal: verify `isBefore(reference)` implements <= semantics.

      Synopsis:
      - given: times A, B such that A < B, A === B, A > B
      - when: calling `A.isBefore(B)` and variants
      - then: earlier and equal return true, later returns false

      Desired assertions:
      1. `new Time(9,0).isBefore(new Time(10,0))` === true
      2. `new Time(9,0).isBefore(new Time(9,0))` === true
      3. `new Time(10,0).isBefore(new Time(9,0))` === false
    */
    expect(new Time(9,0).isBefore(new Time(10,0))).toBe(true)
    expect(new Time(9,0).isBefore(new Time(9,0))).toBe(true)
    expect(new Time(10,0).isBefore(new Time(9,0))).toBe(false)
  })

  it('isAfter should be inclusive and correct', async () => {
    /*
      Goal: verify `isAfter(reference)` implements >= semantics.

      Synopsis:
      - given: times A, B such that A > B, A === B, A < B
      - when: calling `A.isAfter(B)` and variants
      - then: later and equal return true, earlier returns false

      Desired assertions:
      1. `new Time(11,0).isAfter(new Time(10,0))` === true
      2. `new Time(10,0).isAfter(new Time(10,0))` === true
      3. `new Time(9,0).isAfter(new Time(10,0))` === false
    */
    expect(new Time(11,0).isAfter(new Time(10,0))).toBe(true)
    expect(new Time(10,0).isAfter(new Time(10,0))).toBe(true)
    expect(new Time(9,0).isAfter(new Time(10,0))).toBe(false)
  })

  it('add should add durations and handle minute overflow', async () => {
    /*
      Goal: verify `add(delta)` returns a new Time with hours/minutes adjusted,
            including minute overflow into hours.

      Synopsis:
      - given: a start Time and a Duration object
      - when: calling `start.add(delta)`
      - then: result is a new Time with correct hours and minutes

      Test cases to assert:
      1. zero delta returns identical time (but new object)
      2. adding minutes that overflow to next hour (e.g. 1h50 + 0h20 -> 3h10)
      3. adding hours + minutes combined produces expected result
    */
    const start = new Time(5, 15)
    const zero = { hours: 0, minutes: 0 } as Duration
    const resZero = start.add(zero)
    expect(resZero).not.toBe(start)
    expect(resZero.hours).toBe(5)
    expect(resZero.minutes).toBe(15)

    const overflowStart = new Time(1,50)
    const overflowDelta = { hours: 0, minutes: 20 } as Duration
    const overflowRes = overflowStart.add(overflowDelta)
    expect(overflowRes.hours).toBe(2)
    expect(overflowRes.minutes).toBe(10)

    const combinedStart = new Time(9,45)
    const combinedDelta = { hours: 1, minutes: 30 } as Duration
    const combinedRes = combinedStart.add(combinedDelta)
    expect(combinedRes.hours).toBe(11)
    expect(combinedRes.minutes).toBe(15)
  })
})

describe('TimeInterval', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('isInRange returns true for times inside interval and on boundaries', async () => {
    /*
      Goal: verify `isInRange(time)` uses inclusive boundaries.

      Synopsis:
      - given: interval with start S and end E and times T_inside, T_start, T_end
      - when: calling `interval.isInRange()` for each time
      - then: inside, start and end return true

      Desired assertions:
      1. `isInRange(S)` === true
      2. `isInRange(E)` === true
      3. `isInRange(T_inside)` === true

    */
    const start = new Time(9,0)
    const end = new Time(17,0)
    const interval = new TimeInterval(start, end)

    expect(interval.isInRange(start)).toBe(true)
    expect(interval.isInRange(end)).toBe(true)
    expect(interval.isInRange(new Time(12,30))).toBe(true)
  })

  it('isInRange returns false for times outside interval', async () => {
    /*
      Goal: verify `isInRange(time)` returns false for times strictly outside.

      Synopsis:
      - given: interval S..E and times before S and after E
      - when: calling `isInRange()`
      - then: both return false

      Desired assertions:
      1. `isInRange(timeBefore)` === false
      2. `isInRange(timeAfter)` === false
    */
    const start = new Time(9,0)
    const end = new Time(17,0)
    const interval = new TimeInterval(start, end)

    expect(interval.isInRange(new Time(8,59))).toBe(false)
    expect(interval.isInRange(new Time(17,1))).toBe(false)
  })

  it('toString returns a padded human-readable interval', async () => {
    /*
      Goal: verify `toString()` produces the same format as Times.toString,
            which pads hours to two digits and uses 'h' separator.

      Synopsis:
      - given: interval 9h5 -> 10h30
      - when: calling `interval.toString()`
      - then: result equals '09h05 - 10h30'

      Desired assertions:
      1. exact string equality with padded hours and minutes
    */
    const interval = new TimeInterval(new Time(9,5), new Time(10,30))
    expect(interval.toString()).toBe('09h05 - 10h30')
  })
})

// Sample test data / fixtures (to be used by tests above)
const SAMPLE = {
  t000: new Time(0,0),
  t090: new Time(0,90),
  t930: new Time(9,30),
  t905: new Time(9,5),
  t1030: new Time(10,30),
  dur01_20: { hours: 1, minutes: 20 } as Duration,
  dur00_00: { hours: 0, minutes: 0 } as Duration,
}
