import { describe, it, beforeEach, expect } from 'vitest'
import { OrderByComparablePipe } from './order-by-comparable.pipe'

describe('OrderByComparablePipe', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('sorts an array by a single primitive attribute', async () => {
    /*
      Goal: verify the pipe sorts objects by a single primitive attribute (number or string).

      Synopsis:
      - given: an unsorted array of objects each having attribute `age` (numbers)
      - when: calling the pipe.transform(arr, 'age')
      - then: returned array is sorted ascending by `age`

      Desired assertions:
      1. returned array length equals input length
      2. each element's `age` is in increasing order
      3. original array was not mutated (reference equality differs)
    */
    const pipe = new OrderByComparablePipe()
    const input = [makePerson(45, 'Z'), makePerson(12, 'A'), makePerson(30, 'M')]
    const res = pipe.transform(input, 'age')

    expect(res.length).toBe(input.length)
    const ages = res.map(p => p.age)
    expect(ages).toEqual([12, 30, 45])
    // original not mutated
    expect(input[0].age).toBe(45)
  })

  it('sorts using multiple attributes as tie-breakers', async () => {
    /*
      Goal: ensure multi-attribute sorting works (primary then secondary attributes) using `Person` attributes.

      Synopsis:
      - given: array of Person objects with attributes `name` and `age` where some names collide
      - when: transform(arr, 'age', 'name') is called
      - then: array is ordered by `age` first, then by `name`

      Desired assertions:
      1. items with same `age` are ordered by `name`
      2. overall ordering reflects primary attribute then secondary
    */
    const pipe = new OrderByComparablePipe()
    const input = [makePerson(20, 'bob'), makePerson(20, 'alice'), makePerson(18, 'charlie')]
    // primary: age, secondary: name
    const res = pipe.transform(input, 'age', 'name')

    expect(res.map(p => [p.age, p.name])).toEqual([[18, 'charlie'], [20, 'alice'], [20, 'bob']])
  })

  it('returns empty array when input is null', async () => {
    /*
      Goal: ensure pipe handles null input gracefully.

      Synopsis:
      - given: null input
      - when: transform(null, 'any') is called
      - then: returned array is [] (empty)

      Desired assertions:
      1. returned instanceof Array and length === 0
    */
    const pipe = new OrderByComparablePipe()
    const res = pipe.transform(null, 'age')
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(0)
  })

})

// ----------------------
// Sample object factories
// ----------------------
// These helpers produce the simple object shape the tests above expect.
// Only `makePerson` is needed: Person objects have `age` and `name` attributes.

function makePerson(age: number, name = 'John Doe'){
  return { age, name }
}

