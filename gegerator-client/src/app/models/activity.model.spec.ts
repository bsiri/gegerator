import { describe, it, beforeEach, expect } from 'vitest'
import { defaultActivity, someActivity } from 'src/_testhelpers/factories'
import { OtherActivity, OtherActivityJSON } from './activity.model'

describe('OtherActivity', () => {
  let activity: OtherActivity

  beforeEach(() => {
    // synchronous setup: provide a fresh default activity for each test
    activity = defaultActivity()
  })

  it('should expose name and htmlId properties', async () => {
    /*
      Goal of the test: ensure the `name` getter returns the description and
      `htmlId` follows the `other-activity-<id>` pattern.

      Synopsis:
      - given: a default OtherActivity instance
      - when: accessing `name` and `htmlId`
      - then: `name` equals the description and `htmlId` contains the id

      Desired tests and assertions:
      1. `activity.name` equals `activity.description`
      2. `activity.htmlId` equals `other-activity-${activity.id}`
    */
    expect(activity.name).toBe(activity.description)
    expect(activity.htmlId).toBe(`other-activity-${activity.id}`)
  })

  it('toString() should equal format("%d, %h : %n")', async () => {
    /*
      Goal of the test: verify the convenience relation between `toString()`
      and `format()` described in the implementation comment.

      Synopsis:
      - given: an OtherActivity with known day and times
      - when: calling `toString()` and `format('%d, %h : %n')`
      - then: both strings are strictly equal

      Desired tests and assertions:
      1. store the result of `toString()`
      2. store the result of `format('%d, %h : %n')`
      3. assert equality of the two strings
    */
    const s1 = activity.toString()
    const s2 = activity.format('%d, %h : %n')
    expect(s1).toBe(s2)
  })

  it('should serialize to JSON and deserialize back (roundtrip)', async () => {
    /*
      Goal of the test: ensure `toJSON()` produces a plain JSON object that
      `fromJSON()` can consume to recreate an equivalent OtherActivity.

      Synopsis:
      - given: an OtherActivity instance
      - when: calling `toJSON()` then `OtherActivity.fromJSON(json)`
      - then: the reconstructed object matches original properties

      Desired tests and assertions:
      1. call `const json = activity.toJSON()` and assert it matches the
         `OtherActivityJSON` shape (keys present and types correct)
      2. call `const reconstructed = OtherActivity.fromJSON(json)`
      3. assert key properties (`id`, `day`, `startTime`/`endTime`, `description`, `rating`) are equal or equivalent
    */
    const json = activity.toJSON()
    const reconstructed = OtherActivity.fromJSON(json)

    expect(reconstructed.id).toBe(activity.id)
    expect(reconstructed.day.key).toBe(activity.day.key)
    expect(reconstructed.description).toBe(activity.description)
    expect(reconstructed.startTime.hours).toBe(activity.startTime.hours)
    expect(reconstructed.startTime.minutes).toBe(activity.startTime.minutes)
    expect(reconstructed.endTime.hours).toBe(activity.endTime.hours)
    expect(reconstructed.endTime.minutes).toBe(activity.endTime.minutes)
    expect(reconstructed.rating.key).toBe(activity.rating.key)
  })

  it('copy() should clone and apply modifiers', async () => {
    /*
      Goal of the test: verify `copy()` returns a new instance with the same
      properties and that provided modifiers override fields.

      Synopsis:
      - given: an OtherActivity
      - when: calling `copy({ description: 'new' })`
      - then: original is unchanged, clone differs only by the modifier

      Desired tests and assertions:
      1. create `const clone = activity.copy({ description: 'X' })`
      2. assert `clone !== activity` (different reference)
      3. assert `activity.description` unchanged
      4. assert `clone.description === 'X'`
    */
    const originalDesc = activity.description
    const clone = activity.copy({ description: 'X' })

    expect(clone).not.toBe(activity)
    expect(activity.description).toBe(originalDesc)
    expect(clone.description).toBe('X')
    expect(clone.id).toBe(activity.id)
  })

  it('toJSON() result shape matches OtherActivityJSON interface', async () => {
    /*
      Goal of the test: check that keys produced by `toJSON()` are exactly
      those described in `OtherActivityJSON` and values are strings where
      expected.

      Synopsis:
      - given: an OtherActivity
      - when: calling `toJSON()`
      - then: the returned object has `id`, `day`, `startTime`, `endTime`, `description`, `rating`

      Desired tests and assertions:
      1. assert `typeof json.id === 'number'`
      2. assert `typeof json.day === 'string'`
      3. assert `typeof json.startTime === 'string'` and same for `endTime`
      4. assert `typeof json.description === 'string'`
      5. assert `typeof json.rating === 'string'`
    */
    const json = activity.toJSON()
    expect(typeof json.id).toBe('number')
    expect(typeof json.day).toBe('string')
    expect(typeof json.startTime).toBe('string')
    expect(typeof json.endTime).toBe('string')
    expect(typeof json.description).toBe('string')
    expect(typeof json.rating).toBe('string')
  })

  it('fromJSON() should throw on invalid input', async () => {
    /*
      Goal of the test: ensure invalid JSON inputs (invalid day or times)
      produce an error rather than silently producing a malformed object.

      Synopsis:
      - given: a malformed OtherActivityJSON (bad `day` or `startTime`)
      - when: calling `OtherActivity.fromJSON(malformed)`
      - then: an exception is thrown

      Desired tests and assertions:
      1. construct malformed JSON (e.g. `day: 'not-a-day'`)
      2. expect `OtherActivity.fromJSON(malformed)` to throw
    */
    const bad = { ...SAMPLE_JSON, day: 'NOT_A_DAY' }
    expect(() => OtherActivity.fromJSON(bad as any)).toThrow()
  })

})

// ------------------ Test data / fixtures ------------------
// Provide small reusable fixtures used by the tests above.
const SAMPLE_ACTIVITY = defaultActivity()
const SAMPLE_JSON: OtherActivityJSON = SAMPLE_ACTIVITY.toJSON()
