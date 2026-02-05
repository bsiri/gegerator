import { describe, it, beforeEach, expect } from 'vitest'
import { FestivalRoadmap, RoadmapAuthor } from './roadmap.model'
import { Movie } from './movie.model'
import { PlannedMovieSession } from './session.model'
import { OtherActivity } from './activity.model'
import * as factories from 'src/_testhelpers/factories'
import { Days } from './referential.data'
import { Time } from 'src/app/models/time.model'

describe('FestivalRoadmap model', () => {

  beforeEach(() => {
    // setup if needed
  })

  it('should create FestivalRoadmap with given author, sessions and activities', async() => {
    /*
      Goal: ensure the constructor stores provided values.

      Synopsis:
      - given: an author, an array of PlannedMovieSession and an array of OtherActivity
      - when: constructing a FestivalRoadmap
      - then: roadmap.author equals the provided author, roadmap.sessions and roadmap.activities reference the given arrays

      Desired assertions:
      1. `roadmap.author` is `RoadmapAuthor.HUMAN` (or MACHINE depending on the fixture)
      2. `roadmap.sessions` strictly equals the sessions array passed
      3. `roadmap.activities` strictly equals the activities array passed
    */
    const s1 = factories.defaultSession()
    const a1 = factories.defaultActivity()
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [s1], [a1])

    expect(roadmap.author).toBe(RoadmapAuthor.HUMAN)
    expect(roadmap.sessions).toBeInstanceOf(Array)
    expect(roadmap.sessions[0]).toBe(s1)
    expect(roadmap.activities).toBeInstanceOf(Array)
    expect(roadmap.activities[0]).toBe(a1)
  })

  it('isInRoadmap should return true for a Movie that is planned', async() => {
    /*
      Goal: verify isInRoadmap(Movie) detects a movie present in sessions.

      Synopsis:
      - given: a Movie present inside one PlannedMovieSession in roadmap.sessions
      - when: calling isInRoadmap(movie)
      - then: returns true

      Desired assertions:
      1. result is `true`
    */
    const movie = factories.defaultMovie()
    const session = factories.defaultSession({ movie })
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [session], [])

    expect(roadmap.isInRoadmap(movie)).toBe(true)
  })

  it('isInRoadmap should return true for a PlannedMovieSession that is in sessions', async() => {
    /*
      Goal: verify isInRoadmap(PlannedMovieSession) detects membership.

      Synopsis:
      - given: a PlannedMovieSession that exists in roadmap.sessions
      - when: calling isInRoadmap(session)
      - then: returns true

      Desired assertions:
      1. result is `true`
    */
    const session = factories.defaultSession()
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [session], [])

    expect(roadmap.isInRoadmap(session)).toBe(true)
  })

  it('isInRoadmap should return true for an OtherActivity that is in activities', async() => {
    /*
      Goal: verify isInRoadmap(OtherActivity) detects membership.

      Synopsis:
      - given: an OtherActivity that exists in roadmap.activities
      - when: calling isInRoadmap(activity)
      - then: returns true

      Desired assertions:
      1. result is `true`
    */
    const activity = factories.defaultActivity()
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [activity])

    expect(roadmap.isInRoadmap(activity)).toBe(true)
  })

  it('isInRoadmap should throw Error for unsupported types', async() => {
    /*
      Goal: ensure calling isInRoadmap with an unrelated object throws.

      Synopsis:
      - given: an arbitrary object (e.g. `{}`)
      - when: calling isInRoadmap(obj)
      - then: an Error is thrown

      Desired assertions:
      1. call throws an Error
    */
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
    // pass an unrelated object
    expect(() => roadmap.isInRoadmap({} as any)).toThrow()
  })

  it('maybeGetSessionForMovie returns the PlannedMovieSession for a present movie', async() => {
    /*
      Goal: verify maybeGetSessionForMovie returns the session containing the movie.

      Synopsis:
      - given: a Movie that is the `movie` property of one PlannedMovieSession in roadmap.sessions
      - when: calling maybeGetSessionForMovie(movie)
      - then: returns that PlannedMovieSession

      Desired assertions:
      1. returned value is the expected PlannedMovieSession instance
    */
    const movie = factories.defaultMovie()
    const session = factories.defaultSession({ movie })
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [session], [])

    const found = roadmap.maybeGetSessionForMovie(movie)
    expect(found).toBe(session)
  })

  it('maybeGetSessionForMovie returns undefined for a missing movie', async() => {
    /*
      Goal: verify maybeGetSessionForMovie returns undefined when movie not present.

      Synopsis:
      - given: a Movie not referenced by any PlannedMovieSession in roadmap.sessions
      - when: calling maybeGetSessionForMovie(movie)
      - then: returns undefined

      Desired assertions:
      1. returned value is `undefined`
    */
    const movie = factories.defaultMovie({ id: 9999 })
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])

    const found = roadmap.maybeGetSessionForMovie(movie)
    expect(found).toBeUndefined()
  })

  it('dailyPlanning returns a Map with one entry per Day (including empty arrays)', async() => {
    /*
      Goal: ensure dailyPlanning returns a Map whose keys are all Days.enumerate() and values are arrays.

      Synopsis:
      - given: a roadmap with some sessions/activities (possibly none)
      - when: calling dailyPlanning()
      - then: the resulting Map has an entry for each day enumerated by Days.enumerate(), and each value is an array (possibly empty)

      Desired assertions:
      1. map.size equals Days.enumerate().length
      2. for each day, value is an array
    */
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
    const map = roadmap.dailyPlanning()

    const days = Days.enumerate()
    expect(map.size).toBe(days.length)
    for (const d of days){
      const val = map.get(d)
      expect(Array.isArray(val)).toBe(true)
    }
  })

  it('dailyPlanning aggregates sessions and activities and sorts them by day then startTime', async() => {
    /*
      Goal: verify events from sessions and activities are present in the day bucket and ordered by startTime.

      Synopsis:
      - given: multiple PlannedMovieSession and OtherActivity across the same day with different start times
      - when: calling dailyPlanning()
      - then: for that day the array contains all events sorted by `startTime` (and respecting day order)

      Desired assertions:
      1. both session and activity appear in the day's array
      2. array order matches ascending startTime
    */
    // create three events on the same day with different times
    const day = Days.WEDNESDAY
    const sEarly = factories.defaultSession({ id: 11, startTime: new Time(9,0), day })
    const aMid = factories.defaultActivity({ id: 21, startTime: new Time(10,30), endTime: new Time(11,0), day })
    const sLate = factories.defaultSession({ id: 12, startTime: new Time(11,0), day })

    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [sLate, sEarly], [aMid])
    const map = roadmap.dailyPlanning()

    const bucket = map.get(day) || []
    // verify both session and activity appear
    const ids = bucket.map(e => (e as any).id)
    expect(ids).toEqual([sEarly.id, aMid.id, sLate.id])
    // verify ordering by startTime ascending
    const times = bucket.map(e => (e as any).startTime.toMinutes())
    for (let i=1;i<times.length;i++){
      expect(times[i]).toBeGreaterThanOrEqual(times[i-1])
    }
  })

  it('dailyPlanning handles empty sessions and activities (all days map to empty arrays)', async() => {
    /*
      Goal: verify empty inputs produce empty arrays for each day.

      Synopsis:
      - given: roadmap with sessions=[] and activities=[]
      - when: calling dailyPlanning()
      - then: each day maps to an empty array

      Desired assertions:
      1. for each day, array length is 0
    */
    const roadmap = new FestivalRoadmap(RoadmapAuthor.HUMAN, [], [])
    const map = roadmap.dailyPlanning()
    for (const d of Days.enumerate()){
      const arr = map.get(d) || []
      expect(arr.length).toBe(0)
    }
  })

  it('consistent behaviour when multiple sessions reference the same movie id', async() => {
    /*
      Goal: check consistency if duplicate movie ids exist across sessions.

      Synopsis:
      - given: two PlannedMovieSession instances referencing movies with the same id
      - when: calling isInRoadmap(movie) and maybeGetSessionForMovie(movie)
      - then: isInRoadmap returns true and maybeGetSessionForMovie returns one of the matching sessions (first match expected)

      Desired assertions:
      1. isInRoadmap(movie) === true
      2. maybeGetSessionForMovie(movie) is not undefined and has movie.id equal to the queried id
    */
    const movie = factories.defaultMovie({ id: 42 })
    const s1 = factories.defaultSession({ id: 1, movie })
    const s2 = factories.defaultSession({ id: 2, movie })
    const roadmap = new FestivalRoadmap(RoadmapAuthor.MACHINE, [s1, s2], [])

    expect(roadmap.isInRoadmap(movie)).toBe(true)
    const found = roadmap.maybeGetSessionForMovie(movie)
    expect(found).toBeDefined()
    expect(found?.movie.id).toBe(42)
    // expect the first matching session to be returned
    expect(found).toBe(s1)
  })

})

// Reusable test data lists
export const sessionsForSorting: PlannedMovieSession[] = []
export const activitiesForSorting: OtherActivity[] = []
