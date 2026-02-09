import { describe, it, beforeEach, expect } from 'vitest'
import { Theaters, Theater, Days, Day } from './referential.data'

describe('Theaters', () => {
  beforeEach(() => {
    // sync setup if needed
  })

  it('enumerate returns the 4 theaters in expected order', async () => {
    const list = Theaters.enumerate()
    expect(list.length).toBe(4)
    // check order by comparing to known singletons
    expect(list[0]).toBe(Theaters.ESPACE_LAC)
    expect(list[1]).toBe(Theaters.CASINO)
    expect(list[2]).toBe(Theaters.MCL)
    expect(list[3]).toBe(Theaters.PARADISO)
  })

  it('fromKey resolves valid keys to singletons and throws on unknown key', async () => {
    for (const t of Theaters.enumerate()){
      expect(Theaters.fromKey(t.key)).toBe(t)
    }

    expect(() => Theaters.fromKey('UNKNOWN_THEATER')).toThrow()
  })

})

describe('Days', () => {
  beforeEach(() => {
    // sync setup if needed
  })

  it('enumerate returns the 5 days in expected order', async () => {
    const list = Days.enumerate()
    expect(list.length).toBe(5)
    expect(list[0]).toBe(Days.WEDNESDAY)
    expect(list[1]).toBe(Days.THURSDAY)
    expect(list[2]).toBe(Days.FRIDAY)
    expect(list[3]).toBe(Days.SATURDAY)
    expect(list[4]).toBe(Days.SUNDAY)
  })

  it('fromKey resolves valid keys to singletons and throws on unknown key', async () => {
    for (const d of Days.enumerate()){
      expect(Days.fromKey(d.key)).toBe(d)
    }
    expect(() => Days.fromKey('UNKNOWN_DAY')).toThrow()
  })

  it('Day.compare and Days.compare produce consistent ordering', async () => {
    const [wednesday, thursday, friday, saturday, sunday] = Days.enumerate()
    expect(wednesday.compare(sunday)).toBeLessThan(0)
    expect(wednesday.compare(thursday)).toBeLessThan(0)
    expect(thursday.compare(friday)).toBeLessThan(0)
    expect(Days.compare(wednesday, sunday)).toBe(wednesday.compare(sunday))
    expect(Days.compare(thursday, friday)).toBe(thursday.compare(friday))
    expect(Days.compare(saturday, sunday)).toBe(saturday.compare(sunday))
  })

})
