import { beforeEach, describe, it, expect } from 'vitest'
import { movieReducer } from './movie.reducer'
import { MovieActions } from '../actions/movie.actions'
import { someMovie } from 'src/_testhelpers/factories'

/**
 * Test suite skeleton for movie reducer
 *
 * Each test contains a block comment describing the goal, the given/when/then
 * scenario and the desired assertions. Tests are intentionally left without
 * implementation so the developer can fill them following project conventions.
 */

describe('movieReducer', () => {
  beforeEach(() => {
    // Synchronous setup placeholder
  })

  it('should replace state when movies_reloaded is dispatched', async () => {
    /*
      Goal: ensure `movies_reloaded` action replaces the current list
      with the provided movies array.

      Synopsis:
      - given: a non-empty `state` and an action `MovieActions.movies_reloaded({ movies })`
      - when: reducer(state, action) is called
      - then: returned state strictly equals the `movies` payload

      Desired assertions:
      1. returned array equals the provided `movies` (object equality)
      2. the returned array is not the same reference as the previous state
    */
    const m1 = someMovie({ id: 1 })
    const m2 = someMovie({ id: 2 })
    const originalState = [m1]

    const newMovies = [m2]
    const action = MovieActions.movies_reloaded({ movies: newMovies })

    const res = movieReducer(originalState, action)

    expect(res).toBe(newMovies)
    expect(res).not.toBe(originalState)
  })

  it('should append a movie on movie_created', async () => {
    /*
      Goal: verify `movie_created` adds the new movie to the returned state
      while preserving previous entries.

      Synopsis:
      - given: `state` with N movies and `action = MovieActions.movie_created({ movie })`
      - when: reducer(state, action) is called
      - then: returned array length is N+1 and the last element equals the new movie

      Desired assertions:
      1. `state` is not mutated
      2. returned array length is previous length + 1
      3. returned array contains the newly created movie (by id or deep equality)
    */
    const m1 = someMovie({ id: 10 })
    const m2 = someMovie({ id: 11 })
    const originalState = [m1, m2]

    const created = someMovie({ id: 300 })
    const action = MovieActions.movie_created({ movie: created })

    const res = movieReducer(originalState, action)

    expect(originalState.length).toBe(2)
    expect(res.length).toBe(originalState.length + 1)
    expect(res[res.length - 1]).toBe(created)
  })

  it('should replace the existing movie on movie_updated', async () => {
    /*
      Goal: ensure `movie_updated` replaces the item matching the id
      with the provided movie instance.

      Synopsis:
      - given: `state` contains a movie with id X and `action = MovieActions.movie_updated({ movie })` where `movie.id === X`
      - when: reducer(state, action) is called
      - then: returned state contains the updated movie in the same position

      Desired assertions:
      1. `state` is not mutated
      2. returned array length equals initial length
      3. the element with id X in returned array equals the updated movie
      4. other elements remain unchanged

      Notes: test the happy path here, the error case is handled in a different test.
    */
    const m1 = someMovie({ id: 101, title: 'orig' })
    const m2 = someMovie({ id: 102 })
    const originalState = [m1, m2]

    const updated = m1.copy({ title: 'updated' })
    const action = MovieActions.movie_updated({ movie: updated })

    const res = movieReducer(originalState, action)

    expect(res.length).toBe(originalState.length)
    const idx = res.findIndex(m => m.id === m1.id)
    expect(res[idx].title).toBe('updated')
    expect(originalState[0].title).toBe('orig')
  })

  it('should remove the movie on movie_deleted', async () => {
    /*
      Goal: verify `movie_deleted` removes the movie with matching id.

      Synopsis:
      - given: `state` contains a movie with id X and `action = MovieActions.movie_deleted({ movie })`
      - when: reducer(state, action) is called
      - then: returned state does not contain any movie with id X and length is decremented by 1

      Desired assertions:
      1. returned array length is previous length - 1
      2. no element in returned array has id X
      3. original `state` is not mutated
    */
    const m1 = someMovie({ id: 201 })
    const m2 = someMovie({ id: 202 })
    const originalState = [m1, m2]

    const action = MovieActions.movie_deleted({ movie: m1 })

    const res = movieReducer(originalState, action)
    expect(res.length).toBe(originalState.length - 1)
    expect(res.find(m => m.id === m1.id)).toBeUndefined()
    expect(originalState.length).toBe(2)

  })

  it('should throw when movie_updated references unknown id', async () => {
    /*
      Goal: ensure reducer throws a programmatic error when an update targets
      a non-existing id (prevent splice(-1) silent mutation).

      Synopsis:
      - given: `state` without a movie having id Y and `action = MovieActions.movie_updated({ movie })` with `movie.id === Y`
      - when: reducer(state, action) is called
      - then: an Error is thrown containing an explanatory message

      Desired assertions:
      1. calling reducer with an unknown id throws
      2. the error message is human-readable and references the id
    */
    const m1 = someMovie({ id: 301 })
    const m2 = someMovie({ id: 302 })
    const originalState = [m1, m2]

    const updated = someMovie({ id: 9999, title: 'ghost' })
    const action = MovieActions.movie_updated({ movie: updated })

    expect(() => movieReducer(originalState, action)).toThrowError(/Programmatic error.*/)
  })

})
