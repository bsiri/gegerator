import { describe, it, beforeEach, expect } from 'vitest'
import { Movie } from 'src/app/models/movie.model'
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model'
import { someMovie, someSession } from 'src/_testhelpers/factories'
import { selectPlannedMovieSessions } from './session.selectors'

describe('session.selectors — selectPlannedMovieSessions', () => {
  beforeEach(() => {
    // synchronous setup if needed
  })

  it('maps MovieSession[] and Movie[] to PlannedMovieSession[] (happy path)', async () => {
    /*
      Goal: verify the selector builds PlannedMovieSession instances by
      looking up the Movie by `movieId`.

      Synopsis:
      - given: two Movie objects and two MovieSession objects referencing them
      - when: the selector projector is invoked with the indexed movies and sessions
      - then: an array of PlannedMovieSession is returned with the same length
        and each PlannedMovieSession.movie corresponds to the expected Movie

      Desired tests and assertions:
      1. returned.length equals input sessions.length
      2. for each returned item, `item.movie.id` equals the referenced `movieId`
    */
    // Arrange
    const movieA = someMovie({ id: 101 })
    const movieB = someMovie({ id: 102 })
    const indexedMovies: Record<number, Movie> = {}
    indexedMovies[movieA.id] = movieA
    indexedMovies[movieB.id] = movieB

    const plannedA = someSession({ id: 1, movie: movieA })
    const plannedB = someSession({ id: 2, movie: movieB })
    const sessions = [plannedA.toMovieSession(), plannedB.toMovieSession()]

    // Act: call selector projector
    const res = selectPlannedMovieSessions.projector(indexedMovies, sessions) as PlannedMovieSession[]

    // Assert
    expect(res.length).toBe(sessions.length)
    for (let i = 0; i < res.length; i++) {
      expect(res[i].movie.id).toBe(sessions[i].movieId)
    }
  })

  it('filters out sessions whose movieId is missing from movies list', async () => {
    /*
      Goal: ensure sessions referencing unknown movies are removed.

      Synopsis:
      - given: one Movie and two MovieSession objects, one referencing a missing movieId
      - when: selector projector is invoked
      - then: returned array contains only the session whose movie exists

      Desired assertions:
      1. returned array length is 1
      2. returned[0].id equals the id of the session with existing movie
    */
    // Arrange
    const movie = someMovie({ id: 201 })
    const indexedMovies: Record<number, Movie> = {}
    indexedMovies[movie.id] = movie

    const kept = someSession({ id: 11, movie })
    const missingMovieSession = someSession({ id: 12, movie: someMovie({ id: 9999 }) })
    const sessions = [kept.toMovieSession(), missingMovieSession.toMovieSession()]

    // Act
    const res = selectPlannedMovieSessions.projector(indexedMovies, sessions) as PlannedMovieSession[]

    // Assert
    expect(res.length).toBe(1)
    expect(res[0].id).toBe(kept.id)
  })

  it('returns empty array when sessions list is empty', async () => {
    /*
      Goal: selector gracefully handles empty sessions.

      Synopsis:
      - given: empty sessions array and any movies lookup
      - when: selector projector is invoked
      - then: returned array is empty

      Desired assertions:
      1. returned is an empty array
    */
    // Arrange
    const movie = someMovie({ id: 301 })
    const indexedMovies: Record<number, Movie> = { [movie.id]: movie }
    const sessions: MovieSession[] = []

    // Act
    const res = selectPlannedMovieSessions.projector(indexedMovies, sessions) as PlannedMovieSession[]

    // Assert
    expect(res).toEqual([])
  })

  it('supports multiple sessions for the same movie (cardinality)', async () => {
    /*
      Goal: ensure selector returns all sessions even when they reference the same Movie.

      Synopsis:
      - given: one Movie and two MovieSession objects referencing that movie
      - when: selector projector is invoked
      - then: returned array contains both PlannedMovieSession instances

      Desired assertions:
      1. returned.length equals 2
      2. both returned items have `.movie.id` equal to the Movie.id
    */
    // Arrange
    const movie = someMovie({ id: 401 })
    const indexedMovies: Record<number, Movie> = { [movie.id]: movie }

    const p1 = someSession({ id: 21, movie })
    const p2 = someSession({ id: 22, movie })
    const sessions = [p1.toMovieSession(), p2.toMovieSession()]

    // Act
    const res = selectPlannedMovieSessions.projector(indexedMovies, sessions) as PlannedMovieSession[]

    // Assert
    expect(res.length).toBe(2)
    expect(res[0].movie.id).toBe(movie.id)
    expect(res[1].movie.id).toBe(movie.id)
  })

  it('does not mutate input arrays (immutability)', async () => {
    /*
      Goal: ensure selector does not alter input arrays or objects.

      Synopsis:
      - given: movies array and sessions array
      - when: selector projector is invoked
      - then: original movies and sessions arrays remain unchanged

      Desired assertions:
      1. movies array length unchanged
      2. sessions array length unchanged
      3. specific Movie and MovieSession instances remain strictly equal to originals
    */
    // Arrange
    const movie = someMovie({ id: 501 })
    const indexedMovies: Record<number, Movie> = { [movie.id]: movie }

    const p = someSession({ id: 31, movie })
    const sessions = [p.toMovieSession()]

    const sessionsCopy = sessions.slice()
    const indexedMoviesKeys = Object.keys(indexedMovies)

    // Act
    const res = selectPlannedMovieSessions.projector(indexedMovies, sessions) as PlannedMovieSession[]

    // Assert: inputs unchanged
    expect(sessions.length).toBe(sessionsCopy.length)
    expect(sessions[0]).toBe(sessionsCopy[0])
    expect(Object.keys(indexedMovies)).toEqual(indexedMoviesKeys)
    // also ensure result is a new array
    expect(res).not.toBe(sessions)
  })

})
