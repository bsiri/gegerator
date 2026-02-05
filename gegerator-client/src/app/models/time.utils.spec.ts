import { describe, it, beforeEach, expect } from 'vitest';
import { Duration } from 'iso8601-duration';
import { Durations, Times } from './time.utils';
import { Time } from './time.model';


describe('Durations namespace', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('toString should format durations as `#hMM`', async () => {
    /*
      Goal: verify `Durations.toString()` returns human readable durations.

      Synopsis:
      - given: duration objects with various hours/minutes
      - when: calling `Durations.toString(duration)`
      - then: returns strings like '1h05', '0h00', '9h30'

      Desired assertions:
      1. hours not padded (single digit) followed by 'h'
      2. minutes always two digits
    */
    expect(Durations.toString({ hours: 1, minutes: 5 } as Duration)).toBe('1h05')
    expect(Durations.toString({ hours: 0, minutes: 0 } as Duration)).toBe('0h00')
    expect(Durations.toString({ hours: 9, minutes: 30 } as Duration)).toBe('9h30')
  })

  it('fromString should parse valid strings and throw on invalid', async () => {
    /*
      Goal: verify `Durations.fromString()` accepts valid duration strings
            and throws a ValidationErrors-like object for invalid inputs.

      Synopsis:
      - given: valid strings '1h05' and invalid strings '01h5', '1:05'
      - when: calling `fromString`
      - then: valid strings parsed to Duration-like object, invalid throws

      Desired assertions:
      1. parsed object has correct hours and minutes
      2. invalid input results in an error with `{error: 'invalid time format'}`
    */
    const parsed = Durations.fromString('1h05')
    expect(parsed.hours).toBe(1)
    expect(parsed.minutes).toBe(5)

    // invalid formats
    expect(() => Durations.fromString('01h5')).toThrow()
    expect(() => Durations.fromString('1:05')).toThrow()
  })

  it('serialize and deserialize should roundtrip to ISO strings', async () => {
    /*
      Goal: verify `Durations.serialize()` produces ISO8601-like strings
            and `Durations.deserialize()` parses them back to Duration.

      Synopsis:
      - given: duration object
      - when: serialize then deserialize
      - then: resulting object matches original hours/minutes

      Desired assertions:
      1. `serialize({hours:1,minutes:5})` => 'PT1H5M' (or similar)
      2. `deserialize` returns object with hours/minutes numbers
    */
    const dur = { hours: 1, minutes: 5 } as Duration
    const s = Durations.serialize(dur)
    expect(s).toBe('PT1H5M')
    const d = Durations.deserialize(s)
    expect(d.hours).toBe(1)
    expect(d.minutes).toBe(5)
  })
})


describe('Times namespace', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('toString should produce padded hour and minute with "h" separator', async () => {
    /*
      Goal: verify `Times.toString()` pads hours to two digits and minutes
            to two digits and uses 'h' separator.

      Synopsis:
      - given: Time(9,5) and Time(12,30)
      - when: calling `Times.toString()`
      - then: '09h05' and '12h30'

      Desired assertions:
      1. padded hours for single-digit hours
      2. minutes always two digits
    */
    expect(Times.toString(new Time(9,5))).toBe('09h05')
    expect(Times.toString(new Time(12,30))).toBe('12h30')
  })

  it('fromString should parse human-readable times and throw on bad format', async () => {
    /*
      Goal: verify `Times.fromString()` parses strings like '09h05' or '9h05'
            and throws on invalid formats.

      Synopsis:
      - given: valid and invalid strings
      - when: calling `Times.fromString()`
      - then: valid returns Time objects, invalid throws ValidationErrors

      Desired assertions:
      1. `fromString('09h05')` => Time(9,5)
      2. invalid input raises an error
    */
    const t = Times.fromString('09h05')
    expect(t.hours).toBe(9)
    expect(t.minutes).toBe(5)

    expect(() => Times.fromString('9:05')).toThrow()
  })

  it('serialize and deserialize should roundtrip time to HH:MM:SS', async () => {
    /*
      Goal: verify `Times.serialize()` returns `HH:MM:00` and
            `Times.deserialize()` recreates the Time object.

      Synopsis:
      - given: Time instances
      - when: serialize then deserialize
      - then: resulting Time has same hours and minutes

      Desired assertions:
      1. `serialize(Time(9,5))` => '09:05:00'
      2. `deserialize('09:05:00')` => Time(9,5)
    */
    const s = Times.serialize(new Time(9,5))
    expect(s).toBe('09:05:00')
    const t = Times.deserialize('09:05:00')
    expect(t.hours).toBe(9)
    expect(t.minutes).toBe(5)
  })

  it('add delegates to Time.add and handles combinations', async () => {
    /*
      Goal: verify `Times.add(start, delta)` returns the same result
            as `start.add(delta)` for various deltas.

      Synopsis:
      - given: start Time and Duration deltas
      - when: calling `Times.add` and `Time.add`
      - then: both results equal in hours and minutes

      Desired assertions:
      1. zero delta keeps time
      2. minute overflow and hour additions handled
    */
    const start = new Time(5,15)
    const zero = { hours: 0, minutes: 0 } as Duration

    const r1 = Times.add(start, zero)
    const r2 = start.add(zero)

    expect(r1.hours).toBe(r2.hours)
    expect(r1.minutes).toBe(r2.minutes)

    const r3 = Times.add(new Time(1,50), { hours: 0, minutes: 20 } as Duration)
    expect(r3.hours).toBe(2)
    expect(r3.minutes).toBe(10)
  })

  it('isBefore and isAfter should delegate and be inclusive', async () => {
    /*
      Goal: verify `Times.isBefore/isAfter` use inclusive semantics and delegate
            to the Time instance methods.

      Synopsis:
      - given: pairs of times earlier/equal/later
      - when: calling `Times.isBefore/isAfter`
      - then: results match expected booleans

      Desired assertions:
      1. earlier => isBefore true, isAfter false
      2. equal => both true
      3. later => isBefore false, isAfter true
    */
    const earlier = new Time(8,0)
    const equalA = new Time(9,0)
    const equalB = new Time(9,0)
    const later = new Time(10,0)

    expect(Times.isBefore(earlier, equalA)).toBe(true)
    expect(Times.isAfter(earlier, equalA)).toBe(false)

    expect(Times.isBefore(equalA, equalB)).toBe(true)
    expect(Times.isAfter(equalA, equalB)).toBe(true)

    expect(Times.isBefore(later, equalA)).toBe(false)
    expect(Times.isAfter(later, equalA)).toBe(true)
  })

  it('toMinutes and compare should delegate to Time methods', async () => {
    /*
      Goal: verify `Times.toMinutes()` and `Times.compare()` simply call
            the underlying Time methods and return correct values.

      Synopsis:
      - given: Time instances
      - when: calling `Times.toMinutes` and `Times.compare`
      - then: values match Time.toMinutes() and Time.compare()

      Desired assertions:
      1. toMinutes returns correct total minutes
      2. compare returns difference in minutes
    */
    const t1 = new Time(2,30)
    const t2 = new Time(1,0)
    expect(Times.toMinutes(t1)).toBe(t1.toMinutes())
    expect(Times.compare(t1, t2)).toBe(t1.compare(t2))
  })

  it('toStrInterval should format intervals using Times.toString', async () => {
    /*
      Goal: verify `Times.toStrInterval(start,end)` returns strings like
            '09h05 - 10h30' using padded formatting.

      Synopsis:
      - given: start and end Time
      - when: calling `toStrInterval`
      - then: string exactly matches expected format

      Desired assertions:
      1. exact string equality with padded hours/minutes and ' - ' separator
    */
    const s = Times.toStrInterval(new Time(9,5), new Time(10,30))
    expect(s).toBe('09h05 - 10h30')
  })

  it('toString should return empty string for falsy input', async () => {
    /*
      Goal: ensure `_toString` behavior where falsy input yields empty string
            is reachable via public API (passing `null`/`undefined` cast).

      Synopsis:
      - given: `null` or `undefined` cast to any
      - when: calling `Durations.toString(null as any)` or `Times.toString(null as any)`
      - then: returns empty string

      Desired assertions:
      1. calling toString with falsy returns ''
    */
    // pass null/undefined via any cast to reach the guard
    expect(Durations.toString(null as any)).toBe('')
    expect(Times.toString(null as any)).toBe('')
  })
})

// Sample fixtures
const SAMPLE = {
  t0905: new Time(9,5),
  t1030: new Time(10,30),
  dur0105: { hours: 1, minutes: 5 } as Duration,
  dur0000: { hours: 0, minutes: 0 } as Duration,
}
