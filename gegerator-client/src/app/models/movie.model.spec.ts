import { describe, it, beforeEach, expect } from 'vitest'
import { Movie, MovieJSON, MovieRating, MovieRatings } from './movie.model'
import { someMovie } from 'src/_testhelpers/factories'
import { Durations } from './time.utils'

describe('Movie', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('should roundtrip to/from JSON', async () => {
    /*
      Goal of the test: verify that a Movie serialized with `toJSON()` and
      then rehydrated with `Movie.fromJSON()` preserves the important fields.

      Synopsis:
      - given: a `Movie` instance
      - when: calling `toJSON()` then `Movie.fromJSON(...)`
      - then: the resulting `Movie` has the same `id`, `title`, `duration` and `rating`.

      Desired assertions:
      1. `id` and `title` are identical.
      2. `duration` is equivalent (use `Durations.serialize` for comparison).
      3. `rating` is the same `MovieRating` singleton (compare by `key` or instance).
    */
    const movie = someMovie({ rating: MovieRatings.HIGH })

    const json = movie.toJSON()
    const restored = Movie.fromJSON(json)

    expect(restored.id).toBe(movie.id)
    expect(restored.title).toBe(movie.title)
    expect(Durations.serialize(restored.duration)).toBe(Durations.serialize(movie.duration))
    expect(restored.rating).toBe(movie.rating)
  })

  it('toJSON should serialize duration and use rating.key', async () => {
    /*
      Goal of the test: ensure `toJSON()` delegates duration serialization to
      `Durations.serialize` and uses `rating.key` for the `rating` field.

      Synopsis:
      - given: a `Movie` with a known `duration` and a specific `rating`
      - when: calling `toJSON()`
      - then: the returned object has `duration` equal to the serialized string
        and `rating` equal to `movie.rating.key`.

      Notes:
        - test the final outcome directly, no need to check for interactions using spies.
    */
      const duration = Durations.fromString("2h05")
      const movie = someMovie({ duration, rating: MovieRatings.HIGHEST })

      const json = movie.toJSON()
      expect(json.duration).toBe(Durations.serialize(duration))
      expect(json.rating).toBe(movie.rating.key)
  })

  it('fromJSON should deserialize duration and resolve rating, unknown rating throws', async () => {
    /*
      Goal of the test: verify `fromJSON()` uses `Durations.deserialize` and
      `MovieRatings.fromKey()`. Also verify that an unknown rating key throws.

      Synopsis:
      - given: a valid `MovieJSON` and an invalid one (bad rating key)
      - when: calling `Movie.fromJSON(valid)` and `Movie.fromJSON(invalid)`
      - then: the valid one produces a `Movie` with expected fields; the invalid
        one throws an `Error`.

      Desired assertions:
      1. `Durations.deserialize` is used to build the `duration`.
      2. `MovieRatings.fromKey` returns the correct singleton for valid key.
      3. Unknown key leads to thrown `Error`.
    */
    const validJson: MovieJSON = {
      id: 3,
      title: 'FromJSON Test',
      duration: 'PT0H45M',
      rating: MovieRatings.DEFAULT.key
    }

    const movie = Movie.fromJSON(validJson)
    expect(movie.id).toBe(validJson.id)
    expect(movie.title).toBe(validJson.title)
    expect(Durations.serialize(movie.duration)).toBe(validJson.duration)
    expect(movie.rating).toBe(MovieRatings.DEFAULT)

    const invalidJson: MovieJSON = { ...validJson, rating: 'UNKNOWN_KEY' }
    expect(() => Movie.fromJSON(invalidJson)).toThrow()
  })

  it('copy should produce a shallow clone and apply modifiers', async () => {
    /*
      Goal of the test: ensure `copy()` returns a new `Movie` instance,
      applies provided `modifiers`, and performs a shallow clone.

      Synopsis:
      - given: a `Movie` instance and a modifiers object changing `title` and `duration`
      - when: calling `movie.copy(modifiers)`
      - then: returned movie differs by the modified fields, original unchanged,
        and object references for unmodified fields remain identical (shallow clone).

      Desired assertions:
      1. Returned value is a different object (`!==`) from the source.
      2. Modified fields equal the new values.
      3. Unmodified fields reference-equal the original's fields.
    */
    const movie = someMovie()

    const newDuration = Durations.deserialize('PT0H30M')
    const cloned = movie.copy({ title: 'Copy Test 2', duration: newDuration })

    expect(cloned).not.toBe(movie)
    expect(cloned.title).toBe('Copy Test 2')
    expect(cloned.duration).toBe(newDuration)
    expect(cloned.rating).toBe(movie.rating)
  })

  
})

describe('MovieRatings', () => {
  it('enumerate and fromKey should expose the four singletons in order', async () => {
    /*
      Goal of the test: check `MovieRatings.enumerate()` returns the four ratings
      in expected order and `fromKey()` resolves them to the same instances.

      Synopsis:
      - when: calling `MovieRatings.enumerate()` and `MovieRatings.fromKey()`
      - then: enumerate returns [HIGHEST, HIGH, DEFAULT, NEVER] and `fromKey(key)`
        returns the corresponding singleton instance.

      Desired assertions:
      1. Length is 4 and order matches expected.
      2. For each rating, `MovieRatings.fromKey(rating.key) === rating`.
    */
    const list = MovieRatings.enumerate()
    expect(list.length).toBe(4)
    expect(list[0]).toBe(MovieRatings.HIGHEST)
    expect(list[1]).toBe(MovieRatings.HIGH)
    expect(list[2]).toBe(MovieRatings.DEFAULT)
    expect(list[3]).toBe(MovieRatings.NEVER)

    for (const r of list) {
      expect(MovieRatings.fromKey(r.key)).toBe(r)
    }
  })

  it('MovieRating.compare and MovieRatings.compare produce consistent ordering', async () => {
    /*
      Goal of the test: verify ranking logic where lower `rank` means higher priority.

      Synopsis:
      - given: the four MovieRating singletons
      - when: comparing pairs via `compare()` and `MovieRatings.compare()`
      - then: comparisons follow the ranks: HIGHEST < HIGH < DEFAULT < NEVER

      Desired assertions:
      1. `HIGHEST.compare(NEVER) < 0` and similar comparisons for ordering.
      2. `MovieRatings.compare(a,b)` yields the same results as `a.compare(b)`.
    */
    const [highest, high, defaultr, never] = MovieRatings.enumerate()

    expect(highest.compare(never)).toBeLessThan(0)
    expect(highest.compare(high)).toBeLessThan(0)
    expect(high.compare(defaultr)).toBeLessThan(0)
    expect(defaultr.compare(never)).toBeLessThan(0)

    expect(MovieRatings.compare(highest, never)).toBe(highest.compare(never))
    expect(MovieRatings.compare(high, defaultr)).toBe(high.compare(defaultr))
  })

})
