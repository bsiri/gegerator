import { sortByComparableAttributes, chainComparator, Comparable } from './comparable.interface'
import { Time } from './time.model'
import { describe, beforeEach, it, expect } from 'vitest'

describe('comparable.interface utilities', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('should return an empty array when input is null', async () => {
    /*
      Goal of the test: ensure that passing `null` to `sortByComparableAttributes`
      returns an empty array instead of throwing.

      Synopsis:
      - given: `toSort` is `null`, attribute list contains one attribute
      - when: `sortByComparableAttributes(null, 'any')` is called
      - then: the returned value is an empty array (`[]`)

      Desired assertions:
      1. result is an array
      2. result.length === 0
    */
    const res = sortByComparableAttributes(null as any, 'rank')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

  it('should return a new array and not mutate the original input', async () => {
    /*
      Goal: ensure that sorting produces a shallow copy and does not mutate input.

      Synopsis:
      - given: an array of simple objects with a primitive attribute already naturally ordered
      - when: `sortByComparableAttributes` is called
      - then: original array is unchanged and returned array !== original array

      Desired assertions:
      1. original array order remains the same
      2. result !== original
    */
    const original = [factories.makeSimple(1, 1), factories.makeSimple(2, 2)]
    const res = sortByComparableAttributes(original, 'rank')
    expect(res).not.toBe(original)
    expect(res.map(r => r.id)).toEqual([1, 2])
  })

  it('should sort by a single primitive attribute ascending', async () => {
    /*
      Goal: verify sorting by a primitive attribute (number or string).

      Synopsis:
      - given: unsorted array of objects with attribute `rank` (numbers)
      - when: sorting by `'rank'`
      - then: returned array is ordered ascending by `rank`

      Desired assertions:
      1. resulting sequence of `rank` values is sorted ascending
      2. length preserved
    */
    const data = [factories.makeSimple(10, 10), factories.makeSimple(3, 3), factories.makeSimple(7, 7)]
    const res = sortByComparableAttributes(data, 'rank')
    expect(res.map(r => r.id)).toEqual([3, 7, 10])
    expect(res.length).toBe(data.length)
  })

  it('should treat equal primitive values as equal (comparator returns 0)', async () => {
    /*
      Goal: ensure that primitives that are equal compare as 0 after the fix.

      Synopsis:
      - given: two objects with equal primitive attribute value
      - when: using `chainComparator` on that attribute or sorting
      - then: comparator returns 0 for those two values and sorting uses next attribute

      Desired assertions:
      1. comparator(o1, o2) === 0 for equal primitive values
      2. for sortByComparableAttributes, secondary attribute is used to break ties
    */
    const o1 = { id: 1, rank: 5, tie: 2 }
    const o2 = { id: 2, rank: 5, tie: 1 }
    const cmpSingle = chainComparator('rank')
    expect(cmpSingle(o1 as any, o2 as any)).toBe(0)

    const res = sortByComparableAttributes([o1, o2], 'rank', 'tie')
    expect(res.map(r => r.id)).toEqual([2, 1])
  })

  it('should sort by multiple attributes (primary then secondary tie-breaker)', async () => {
    /*
      Goal: verify multi-attribute sorting order.

      Synopsis:
      - given: array of objects with attributes `a` and `b` where several have same `a`
      - when: sorting by `a` then `b`
      - then: objects are ordered by `a` ascending, and for equal `a` by `b` ascending

      Desired assertions:
      1. groups by `a` are in ascending order
      2. within each group, `b` is ascending
    */
    const items = [
      factories.makeWithSecondary(1, 2, new Time(0, 50)),
      factories.makeWithSecondary(2, 1, new Time(1, 9)),
      factories.makeWithSecondary(3, 2, new Time(0, 10)),
      factories.makeWithSecondary(4, 1, new Time(0, 20)),
    ]
    const res = sortByComparableAttributes(items, 'a', 'b')
    expect(res.map(x => x.id)).toEqual([4, 2, 3, 1])
  })

  it('should accept an attribute whose value implements `compare` and use it', async () => {
    /*
      Goal: ensure attributes that are objects implementing `compare` are used.

      Synopsis:
      - given: objects where attribute `score` is an object implementing `compare`
      - when: sorting by `score`
      - then: the `compare` method on those objects is invoked and determines order

      Desired assertions:
      1. resulting order reflects the behavior of the custom `compare`
      2. comparator calls the `compare` method (can be asserted with a spy in real test)

      Note: this is a UI/unit style test; implement by creating a tiny class
      implementing `Comparable<T>` and supplying instances as attribute values.
    */
    const items = [factories.makeWithComparable(1, 10), factories.makeWithComparable(2, 3), factories.makeWithComparable(3, 7)]
    const res = sortByComparableAttributes(items, 'score')
    expect(res.map(x => x.id)).toEqual([2, 3, 1])
  })

  it('should throw when an attribute is missing on an object', async () => {
    /*
      Goal: ensure that attempting to order by a non-existent attribute throws.

      Synopsis:
      - given: array of objects without attribute `missingAttr`
      - when: sorting by `'missingAttr'`
      - then: `_makeGetter` should throw an Error and sort operation should fail

      Desired assertions:
      1. calling `sortByComparableAttributes` rejects/throws
      2. error message mentions the missing attribute name
    */
    const items = [factories.makeSimple(1, 1), factories.makeSimple(2, 2)]
    expect(() => sortByComparableAttributes(items as any, 'missingAttr')).toThrowError(/cannot order by missingAttr/)
  })

  it('should throw when attribute value is an object without a `compare` method', async () => {
    /*
      Goal: ensure that objects with a non-comparable attribute cause an error.

      Synopsis:
      - given: objects where `meta` is an object but does not have `compare`
      - when: sorting by `'meta'`
      - then: `_makeGetter` throws an Error indicating attribute is not Comparable

      Desired assertions:
      1. sort operation throws
      2. error message indicates attribute is not Comparable or primitive
    */
    const items = [{ meta: { foo: 1 } }, { meta: { foo: 2 } }]
    expect(() => sortByComparableAttributes(items as any, 'meta')).toThrowError(/cannot order by meta/)
  })

})


// Test data and small helpers (factories) used by the above tests
// Keep simple, real instances so integrating the real assertions is straightforward.

class NumberComparable implements Comparable<NumberComparable> {
  constructor(public value: number) {}
  compare(this: NumberComparable, other: NumberComparable): number {
    if (this.value === other.value) return 0
    return this.value < other.value ? -1 : 1
  }
}

export const factories = {
  makeSimple: (id: number, rank: number) => ({ id, rank }),
  makeWithSecondary: (id: number, a: number, b: Time) => ({ id, a, b }),
  makeWithComparable: (id: number, v: number) => ({ id, score: new NumberComparable(v) }),
}
