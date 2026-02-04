import { describe, it, beforeEach, expect } from 'vitest'
import { EventRating, EventRatings, PlannableEvent } from './plannable.model'
import { Days } from './referential.data'
import { Time } from './time.model'

describe('EventRating / EventRatings', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('should create an EventRating and toString returns the key', async () => {
    /*
      Goal of the test: verify that an `EventRating` instance exposes its
      `key`, `rank`, `name`, `description` and that `toString()` returns the
      `key` string.

      Synopsis:
      - given: a constructed `EventRating`
      - when: calling `toString()`
      - then: the returned value equals the `key` and other fields are set

      Desired assertions:
      1. `rating.key` matches the constructor argument.
      2. `rating.rank` matches the constructor argument.
      3. `rating.toString()` returns `rating.key`.
    */
    const rating = new EventRating('TEST', 5, 'Test name', 'A description')
    expect(rating.key).toBe('TEST')
    expect(rating.rank).toBe(5)
    expect(rating.name).toBe('Test name')
    expect(rating.description).toBe('A description')
    expect(rating.toString()).toBe('TEST')
  })

  it('enumerate should return the known ratings in expected order', async () => {
    /*
      Goal of the test: ensure `EventRatings.enumerate()` returns the list of
      singleton `EventRating` instances in the expected priority/order.

      Synopsis:
      - when: calling `EventRatings.enumerate()`
      - then: the returned array contains `MANDATORY`, `DEFAULT`, `NEVER` in that order

      Desired assertions:
      1. The length of the array is 3.
      2. The first element is `EventRatings.MANDATORY`, second `EventRatings.DEFAULT`, third `EventRatings.NEVER`.
    */
    const list = EventRatings.enumerate()
    expect(list.length).toBe(3)
    expect(list[0]).toBe(EventRatings.MANDATORY)
    expect(list[1]).toBe(EventRatings.DEFAULT)
    expect(list[2]).toBe(EventRatings.NEVER)
  })

  it('fromKey should resolve known keys and throw for unknown keys', async () => {
    /*
      Goal of the test: verify `EventRatings.fromKey()` returns the matching
      singleton instance for valid keys and throws an `Error` for unknown keys.

      Synopsis:
      - given: each known key and an unknown key
      - when: calling `EventRatings.fromKey(key)`
      - then: valid keys return their singletons; unknown key throws

      Desired assertions:
      1. For each rating in `EventRatings.enumerate()`, `fromKey(r.key) === r`.
      2. Calling `fromKey('BOGUS')` throws an `Error`.
    */
    for (const r of EventRatings.enumerate()){
      expect(EventRatings.fromKey(r.key)).toBe(r)
    }
    expect(() => EventRatings.fromKey('BOGUS')).toThrow()
  })

  it('compare should order by rank and EventRatings.compare delegates', async () => {
    /*
      Goal of the test: check the `compare` semantics where lower `rank` means
      higher priority and that `EventRatings.compare(a,b)` delegates to
      `a.compare(b)`.

      Synopsis:
      - given: the three rating singletons
      - when: comparing pairs
      - then: ordering by rank is correct

      Desired assertions:
      1. `MANDATORY.compare(NEVER) < 0` and similar transitive checks.
      2. `EventRatings.compare(a,b) === a.compare(b)` for sample pairs.
    */
    const [mandatory, defaultr, never] = EventRatings.enumerate()
    expect(mandatory.compare(never)).toBeLessThan(0)
    expect(mandatory.compare(defaultr)).toBeLessThan(0)
    expect(defaultr.compare(never)).toBeLessThan(0)
    expect(EventRatings.compare(mandatory, never)).toBe(mandatory.compare(never))
  })

})


