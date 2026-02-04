import { describe, it, beforeEach, expect } from 'vitest';
import { WizardConfiguration, WizardConfigurationJSON, TheaterRatings, TheaterRating } from './wizardconfiguration.model';


describe('WizardConfiguration model', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('toJSON should produce a plain JSON with rating keys and bias', async () => {
    /*
      Goal: ensure `toJSON()` returns an object matching `WizardConfigurationJSON`.

      Synopsis:
      - given: a WizardConfiguration with non-default TheaterRatings and a
        custom `movieVsTheaterBias`
      - when: calling `toJSON()`
      - then: returned object contains string keys for each theater rating
              and a numeric `movieVsTheaterBias`.

      Desired assertions:
      1. returned object has keys: `espaceLacRating`, `casinoRating`,
         `paradisoRating`, `mclRating`, `movieVsTheaterBias`
      2. each rating property equals the `.key` of the corresponding
         `TheaterRating` instance
      3. `movieVsTheaterBias` preserves the numeric value
    */
    const cfg = new WizardConfiguration(TheaterRatings.HIGHEST, TheaterRatings.HIGH, TheaterRatings.DEFAULT, TheaterRatings.NEVER, 0.77)
    const json = cfg.toJSON()

    expect(json).toHaveProperty('espaceLacRating')
    expect(json).toHaveProperty('casinoRating')
    expect(json).toHaveProperty('paradisoRating')
    expect(json).toHaveProperty('mclRating')
    expect(json).toHaveProperty('movieVsTheaterBias')

    expect(json.espaceLacRating).toBe(TheaterRatings.HIGHEST.key)
    expect(json.casinoRating).toBe(TheaterRatings.HIGH.key)
    expect(json.paradisoRating).toBe(TheaterRatings.DEFAULT.key)
    expect(json.mclRating).toBe(TheaterRatings.NEVER.key)
    expect(json.movieVsTheaterBias).toBeCloseTo(0.77)
  })


  it('roundtrip toJSON/fromJSON preserves data', async () => {
    /*
      Goal: ensure serializing then deserializing yields equivalent data.

      Synopsis:
      - given: a WizardConfiguration instance
      - when: `WizardConfiguration.fromJSON(original.toJSON())`
      - then: the reconstructed instance represents the same configuration

      Desired assertions:
      1. `reconstructed.toJSON()` deep-equals `original.toJSON()`
    */
    const orig = new WizardConfiguration(TheaterRatings.HIGH, TheaterRatings.HIGHEST, TheaterRatings.DEFAULT, TheaterRatings.DEFAULT, 0.33)
    const json = orig.toJSON()
    const reconstructed = WizardConfiguration.fromJSON(json as WizardConfigurationJSON)
    expect(reconstructed.toJSON()).toEqual(json)
  })

  it('copy returns a new instance and applies modifiers', async () => {
    /*
      Goal: verify `copy(modifiers)` returns a new `WizardConfiguration`
            instance with properties merged from `modifiers`.

      Synopsis:
      - given: an instance `orig`
      - when: calling `const copy = orig.copy({ movieVsTheaterBias: 0.7 })`
      - then: `copy` differs from `orig`, has the modified bias, and
              original remains unchanged

      Desired assertions:
      1. returned object is instance of `WizardConfiguration`
      2. returned !== original
      3. modified field updated, others unchanged
    */
    const orig = new WizardConfiguration(TheaterRatings.DEFAULT, TheaterRatings.DEFAULT, TheaterRatings.DEFAULT, TheaterRatings.DEFAULT, 0.5)
    const copy = orig.copy({ movieVsTheaterBias: 0.7 })
    expect(copy).toBeInstanceOf(WizardConfiguration)
    expect(copy).not.toBe(orig)
    expect(copy.movieVsTheaterBias).toBeCloseTo(0.7)
    // other fields unchanged
    expect(copy.espaceLacRating).toBe(orig.espaceLacRating)
  })

  it('fromJSON should throw on malformed input', async () => {
    /*
      Goal: define expected behavior on malformed JSON input and assert it.

      Synopsis:
      - given: missing keys or wrong types in `WizardConfigurationJSON`
      - when: calling `fromJSON(badJson)`
      - then: method throws an Error (or handles gracefully depending on
              chosen contract); test should assert the chosen behavior.

      Desired assertions:
      1. calling `fromJSON` with incomplete object throws
      2. error message is helpful for debugging
    */
    // missing keys
    expect(() => WizardConfiguration.fromJSON({} as any)).toThrow()
  })

})


describe('TheaterRating and TheaterRatings', () => {
  beforeEach(() => {
    // synchronous setup
  })

  it('TheaterRatings.enumerate and fromKey behave as expected', async () => {
    /*
      Goal: test enumeration and lookup helpers of `TheaterRatings`.

      Synopsis:
      - given: call to `TheaterRatings.enumerate()` and valid/invalid keys
      - when: using `fromKey` with existing and non-existing keys
      - then: valid keys return the right `TheaterRating`, invalid keys throw

      Desired assertions:
      1. `enumerate()` returns an array containing `TheaterRating` objects
      2. `fromKey(validKey)` returns the matching rating
      3. `fromKey(invalidKey)` throws an Error
    */
    const list = TheaterRatings.enumerate()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBe(4)
    expect(list).toEqual([
        TheaterRatings.HIGHEST, 
        TheaterRatings.HIGH, 
        TheaterRatings.DEFAULT, 
        TheaterRatings.NEVER
    ])

    expect(TheaterRatings.fromKey('HIGHEST')).toBe(TheaterRatings.HIGHEST)
    expect(TheaterRatings.fromKey('HIGH')).toBe(TheaterRatings.HIGH)
    expect(TheaterRatings.fromKey('DEFAULT')).toBe(TheaterRatings.DEFAULT)
    expect(TheaterRatings.fromKey('NEVER')).toBe(TheaterRatings.NEVER)

    expect(() => TheaterRatings.fromKey('UNKNOWN')).toThrow()   
  })

  it('TheaterRating.compare implements Comparable semantics', async () => {
    /*
      Goal: ensure `TheaterRating.compare` reflects the `rank` ordering.

      Synopsis:
      - given: two ratings with different ranks
      - when: calling `compare()` on each ordering
      - then: comparison result sign matches rank difference

      Desired assertions:
      1. higher-ranked rating compare lower-ranked yields negative/positive values
    */
    const highest = TheaterRatings.HIGHEST
    const never = TheaterRatings.NEVER
    expect(highest.compare(never)).toBeLessThan(0)
    expect(never.compare(highest)).toBeGreaterThan(0)
  })

})

