import { describe, it, beforeEach, expect } from 'vitest'
import { OrderByLowercasePipe } from './order-by-lowercase.pipe'

describe('OrderByLowercasePipe', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('sorts strings case-insensitively by given attribute', async () => {
    /*
      Goal: verify ordering ignores case differences.

      Synopsis:
      - given: array of objects each with attribute `title` containing mixed-case strings
      - when: calling pipe.transform(arr, 'title')
      - then: returned array is sorted as if all titles were lowercased

      Desired assertions:
      1. returned titles in lowercase-sorted order
      2. original array not mutated
    */
    const pipe = new OrderByLowercasePipe()
    const input = [ { title: 'banana' }, { title: 'Apple' }, { title: 'cherry' } ]
    const res = pipe.transform(input, 'title')

    expect(res.map(r => r.title)).toEqual(['Apple', 'banana', 'cherry'].sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase())).map(x=>x))
    // ensure original is not mutated
    expect(input[0].title).toBe('banana')
  })

  it('throws when attribute is missing on objects', async () => {
    /*
      Goal: ensure pipe signals errors when asked to sort by a non-existent attribute.

      Synopsis:
      - given: array of objects without attribute `missing`
      - when: transform(arr, 'missing') is called
      - then: pipe throws an Error

      Desired assertions:
      1. calling transform triggers an exception
    */
    const pipe = new OrderByLowercasePipe()
    const input = [ { name: 'a' }, { name: 'b' } ]
    expect(() => pipe.transform(input as any, 'missing')).toThrow()
  })

  it('does not mutate the original array', async () => {
    /*
      Goal: ensure the pipe returns a new sorted array and leaves the input unmodified.

      Synopsis:
      - given: an input array
      - when: transform(arr, 'attr') is called
      - then: returned array !== input array, and input order unchanged

      Desired assertions:
      1. returned !== input
      2. input remains in its original order
    */
    const pipe = new OrderByLowercasePipe()
    const input = [ { title: 'b' }, { title: 'a' } ]
    const copy = input.slice()
    const res = pipe.transform(input, 'title')
    expect(res).not.toBe(input)
    expect(input).toEqual(copy)
  })

})
