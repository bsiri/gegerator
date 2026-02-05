import { describe, it, beforeEach, expect } from 'vitest'

import { MovieSession, PlannedMovieSession } from './session.model'
import { EventRatings } from './plannable.model'
import { Theaters, Days } from './referential.data'
import { Movie, MovieRatings } from './movie.model'
import { Times } from './time.utils'
import { Time } from './time.model'
import { someMovie } from 'src/_testhelpers/factories'

// Test suite for MovieSession
describe('MovieSession (model)', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('should construct and expose properties', async () => {
    /*
      Goal: verify that MovieSession constructor stores provided values on the instance.

      Synopsis:
      - given: explicit primitive and domain values for id, movieId, theater, day, startTime and rating
      - when: a new MovieSession is constructed
      - then: the instance exposes the same values on its public properties

      Desired tests and assertions:
      1. `id` and `movieId` match the provided numbers
      2. `theater` and `day` reference the provided enumeration instances
      3. `startTime` equals the provided Time object
      4. `rating` equals the provided EventRating
    */
    const id = 5
    const movieId = 123
    const theater = Theaters.ESPACE_LAC
    const day = Days.FRIDAY
    const startTime = new Time(9, 30)
    const rating = EventRatings.DEFAULT

    const ms = new MovieSession(id, movieId, theater, day, startTime, rating)

    expect(ms.id).toBe(id)
    expect(ms.movieId).toBe(movieId)
    expect(ms.theater).toBe(theater)
    expect(ms.day).toBe(day)
    expect(ms.startTime).toBe(startTime)
    expect(ms.rating).toBe(rating)
  })

  it('should serialize to JSON with correct keys', async () => {
    /*
      Goal: ensure toJSON() produces a plain object ready to be sent to server.

      Synopsis:
      - given: a MovieSession instance with known theater/day/time/rating
      - when: calling .toJSON()
      - then: resulting object contains keys: id, movieId, theater, day, startTime, rating

      Desired tests and assertions:
      1. `theater` and `day` are serialized as their `key` strings
      2. `startTime` is serialized using `Times.serialize`
      3. `rating` is serialized as its `key`
      4. numeric fields `id` and `movieId` are preserved
    */
    const ms = sampleMovieSession()

    const json = ms.toJSON()

    expect(json.id).toBe(7)
    expect(json.movieId).toBe(ms.movieId)
    expect(json.theater).toBe(ms.theater.key)
    expect(json.day).toBe(ms.day.key)
    expect(json.startTime).toBe(Times.serialize(ms.startTime))
    expect(json.rating).toBe(ms.rating.key)
  })

  it('should deserialize from JSON and produce an equivalent instance', async () => {
    /*
      Goal: ensure MovieSession.fromJson reconstructs a domain instance from server JSON.

      Synopsis:
      - given: a valid MovieSessionJSON object (matching server shape)
      - when: calling MovieSession.fromJson(json)
      - then: returned MovieSession has equivalent semantic values

      Desired tests and assertions:
      1. `theater` and `day` are converted back to enumeration instances (Theaters/Days)
      2. `startTime` is deserialized using `Times.deserialize`
      3. `rating` is converted using `EventRatings.fromKey`
      4. numeric fields preserved
    */
    const ms = sampleMovieSession()
    const json = ms.toJSON()

    const reconstructed = MovieSession.fromJson(json)

    expect(reconstructed.id).toBe(ms.id)
    expect(reconstructed.movieId).toBe(ms.movieId)
    expect(reconstructed.theater).toBe(ms.theater)
    expect(reconstructed.day.key).toBe(ms.day.key)
    expect(reconstructed.startTime.toMinutes()).toBe(ms.startTime.toMinutes())
    expect(reconstructed.rating).toBe(ms.rating)
  })

  it('copy creates a clone and applies given modifiers (MovieSession)', async () => {
    /*
      Goal: ensure MovieSession.copy(modifiers) returns a new MovieSession with overridden fields.

      Synopsis:
      - given: a MovieSession instance
      - when: calling copy({ movieId: X, rating: EventRatings.HIGH })
      - then: returned instance is not the same reference, has the overridden values and original remains unchanged
    */
    const ms = sampleMovieSession()
    const cloned = ms.copy({ movieId: 42, rating: EventRatings.MANDATORY })

    expect(cloned).not.toBe(ms)
    expect(cloned.movieId).toBe(42)
    expect(ms.movieId).not.toBe(42)
    expect(cloned.rating).toBe(EventRatings.MANDATORY)
  })

  it('toJSON and fromJson roundtrip should preserve data', async () => {
    /*
      Goal: ensure a MovieSession roundtrip through toJSON() and fromJson() keeps semantic equality.

      Synopsis:
      - given: a MovieSession instance
      - when: json = instance.toJSON(); then MovieSession.fromJson(json)
      - then: the reconstructed instance matches original on all meaningful properties

      Desired tests and assertions:
      1. The reconstructed instance's `movieId`, `theater.key`, `day.key`, `rating.key`, and serialized startTime match original's
    */
    const original = samplePlannedMovieSession()
    const json = original.toMovieSession().toJSON()
    const round = MovieSession.fromJson(json)

    expect(round.movieId).toBe(original.movie.id)
    expect(round.theater).toBe(original.theater)
    expect(round.day.key).toBe(original.day.key)
    expect(round.rating).toBe(original.rating)
    expect(round.startTime.toMinutes()).toBe(original.startTime.toMinutes())
  })
})


// Test suite for PlannedMovieSession
describe('PlannedMovieSession (model)', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('should compute endTime as startTime + movie.duration', async () => {
    /*
      Goal: verify the `endTime` getter uses Times.add(startTime, movie.duration).

      Synopsis:
      - given: a PlannedMovieSession with a Movie having a known duration and a given startTime
      - when: reading `.endTime`
      - then: endTime equals Times.add(startTime, movie.duration)

      Desired tests and assertions:
      1. endTime.toMinutes() equals startTime.toMinutes() + movie.duration in minutes
    */
    const plannedSession = samplePlannedMovieSession()
    const expectedMinutes = plannedSession.startTime.toMinutes() + ((plannedSession.movie.duration.hours ?? 0) * 60 + (plannedSession.movie.duration.minutes ?? 0))
    expect(plannedSession.endTime.toMinutes()).toBe(expectedMinutes)
  })

  it('should expose htmlId and name from id and movie.title', async () => {
    /*
      Goal: ensure `htmlId` and `name` getters are derived from id and movie.title.

      Synopsis:
      - given: a PlannedMovieSession with id and movie.title set
      - when: reading `.htmlId` and `.name`
      - then: htmlId equals `planned-movie-session-${id}` and name equals movie.title

      Desired tests and assertions:
      1. htmlId string includes the id
      2. name equals the movie's title
    */
    const plannedSession = samplePlannedMovieSession()
    expect(plannedSession.htmlId).toBe(`planned-movie-session-${plannedSession.id}`)
    expect(plannedSession.name).toBe(plannedSession.movie.title)
  })

  it('format should replace tokens %d %h %t %n correctly', async () => {
    /*
      Goal: verify the format(fmtString) method substitutes tokens with the expected strings.

      Synopsis:
      - given: a PlannedMovieSession with known day, start/end times, theater and movie.title
      - when: calling format('%d - %h - %t - %n')
      - then: resulting string contains the day.name, the time interval from Times.toStrInterval, theater.name and movie.title in the right places

      Important: this is a UI/string formatting test and must rely on the textual output of Times.toStrInterval.

      Desired tests and assertions:
      1. '%d' replaced by day.name
      2. '%h' replaced by Times.toStrInterval(startTime, endTime)
      3. '%t' replaced by theater.name
      4. '%n' replaced by movie.title
    */
    const plannedSession = samplePlannedMovieSession()
    const formatted = plannedSession.format('%d - %h - %t - %n')
    const expected = `${plannedSession.day.name} - ${Times.toStrInterval(plannedSession.startTime, plannedSession.endTime)} - ${plannedSession.theater.name} - ${plannedSession.movie.title}`
    expect(formatted).toBe(expected)
  })

  it('toString should produce the canonical representation', async () => {
    /*
      Goal: ensure toString() returns the same value as format with the default pattern.

      Synopsis:
      - given: a PlannedMovieSession
      - when: calling toString() and format('%d, %h, %t : %n')
      - then: both strings are identical

      Desired tests and assertions:
      1. toString() equals format('%d, %h, %t : %n')
    */
    const plannedSession = samplePlannedMovieSession()
    expect(plannedSession.toString()).toBe(plannedSession.format('%d, %h, %t : %n'))
  })

  it('checkChangesRequireReload returns true when rating becomes MANDATORY', async () => {
    /*
      Goal: test the business rule where a transition to EventRatings.MANDATORY requires reload.

      Synopsis:
      - given: original PlannedMovieSession with rating != MANDATORY
      - when: calling checkChangesRequireReload(modified) where modified.rating == MANDATORY
      - then: method returns true

      Also test the inverse case where it should return false.

      Desired tests and assertions:
      1. returns true for non-mandatory -> mandatory
      2. returns false for mandatory -> default or non-mandatory -> non-mandatory
    */
    const plannedSession = samplePlannedMovieSession()
    
    const modifiedToMandatory = plannedSession.copy({ rating: EventRatings.MANDATORY })
    expect(plannedSession.checkChangesRequireReload(modifiedToMandatory)).toBe(true)

    const modifiedNoChange = plannedSession.copy({ rating: EventRatings.DEFAULT })
    expect(plannedSession.checkChangesRequireReload(modifiedNoChange)).toBe(false)

    const sMand = plannedSession.copy({ rating: EventRatings.MANDATORY })
    const modifiedFromMand = sMand.copy({ rating: EventRatings.DEFAULT })
    expect(sMand.checkChangesRequireReload(modifiedFromMand)).toBe(false)
  })

  it('toMovieSession maps fields into a MovieSession instance', async () => {
    /*
      Goal: verify toMovieSession() converts the planned aggregate into the raw MovieSession model.

      Synopsis:
      - given: a PlannedMovieSession with movie.id, theater, day, startTime, rating
      - when: calling toMovieSession()
      - then: returned MovieSession has movieId === movie.id and other fields copied

      Desired tests and assertions:
      1. movieId equals movie.id
      2. theater, day, startTime and rating are preserved
    */
    const plannedSession = samplePlannedMovieSession()
    const ms = plannedSession.toMovieSession()

    expect(ms.movieId).toBe(plannedSession.movie.id)
    expect(ms.theater.key).toBe(plannedSession.theater.key)
    expect(ms.day.key).toBe(plannedSession.day.key)
    expect(ms.startTime.toMinutes()).toBe(plannedSession.startTime.toMinutes())
    expect(ms.rating.key).toBe(plannedSession.rating.key)
  })

  it('copy creates a shallow clone and applies given modifiers', async () => {
    /*
      Goal: ensure copy(modifiers) returns a new PlannedMovieSession with same values except overridden by modifiers.

      Synopsis:
      - given: an original PlannedMovieSession
      - when: calling copy({ movie: otherMovie })
      - then: returned instance is not the same reference, has the overridden values and original remains unchanged

      Desired tests and assertions:
      1. returned !== original
      2. returned.movie equals otherMovie
      3. original still has its original values
    */
    const plannedSession = samplePlannedMovieSession()
    const otherMovie = sampleOtherMovie()
    const cloned = plannedSession.copy({ movie: otherMovie })

    expect(cloned).not.toBe(plannedSession)
    expect(cloned.movie).toBe(otherMovie)
    expect(plannedSession.movie).not.toBe(otherMovie)
  })
})

// --- Shared test fixtures (used by tests that are not constructor-focused)

function sampleMovie(): Movie {
   return new Movie(11, 'Some movie', new Time(1, 30), MovieRatings.DEFAULT)
}

function sampleOtherMovie(): Movie {
   return new Movie(22, 'Other movie', new Time(2, 0), MovieRatings.DEFAULT)
}

function sampleMovieSession(): MovieSession{
   return new MovieSession(7, sampleMovie().id, Theaters.CASINO, Days.SATURDAY, new Time(14,15), EventRatings.DEFAULT)
}

function samplePlannedMovieSession(): PlannedMovieSession {
    return new PlannedMovieSession(
        3, 
        sampleMovie(), 
        Theaters.ESPACE_LAC, 
        Days.FRIDAY, 
        new Time(18, 0), 
        EventRatings.DEFAULT
    )
}