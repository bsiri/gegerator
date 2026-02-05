import { describe, it, beforeEach, expect } from 'vitest';
import { AppState } from './app.state';
import { WizardConfiguration } from './wizardconfiguration.model';
import { defaultMovie, defaultSession, defaultActivity } from '../../../_testhelpers/factories';
import { Movie } from 'src/app/models/movie.model';
import { MovieSession } from 'src/app/models/session.model';
import { OtherActivity } from 'src/app/models/activity.model';


describe('AppState model', () => {
  beforeEach(() => {
    // synchronous setup if required
  })

  it('toJSON should serialize nested domain objects to AppStateJSON', async () => {
    /*
      Goal: verify `toJSON()` produces an `AppStateJSON` object where nested
            domain objects are converted using their own `toJSON()`.

      Synopsis:
      - given: an AppState constructed with a WizardConfiguration, a list of
        Movie, MovieSession and OtherActivity instances (use factories)
      - when: calling `appState.toJSON()`
      - then: returned object has keys `wizardConfiguration`, `movies`,
        `sessions`, `activities` and each entry is the result of the
        corresponding `.toJSON()` method of the nested object.

      Desired assertions and steps to implement:
      1. construct sample domain objects via factories (or direct constructors)
      2. call `toJSON()` and assert the presence of the four top-level keys
      3. assert `movies[i]` equals `moviesInstances[i].toJSON()` for a few items
      4. assert `sessions` and `activities` arrays are mapped using their
         `.toJSON()` methods
    */
    const wiz = new WizardConfiguration()
    const movies = [ defaultMovie() ]
    const sessions = [ defaultSession().toMovieSession() ]
    const activities = [ defaultActivity() ]

    const appState = new AppState(wiz, movies, sessions, activities)
    const json = appState.toJSON()

    expect(json).toHaveProperty('wizardConfiguration')
    expect(json).toHaveProperty('movies')
    expect(json).toHaveProperty('sessions')
    expect(json).toHaveProperty('activities')

    expect(Array.isArray(json.movies)).toBe(true)
    expect(json.movies.length).toBe(1)
    expect(json.movies[0]).toEqual(movies[0].toJSON())
    expect(json.sessions[0]).toEqual(sessions[0].toJSON())
    expect(json.activities[0]).toEqual(activities[0].toJSON())
  })

  it('fromJSON should recreate AppState using nested fromJSON constructors', async () => {
    /*
      Goal: verify `AppState.fromJSON()` reconstructs an `AppState` using
            `WizardConfiguration.fromJSON`, `Movie.fromJSON`,
            `MovieSession.fromJson` and `OtherActivity.fromJSON`.

      Synopsis:
      - given: a well-formed `AppStateJSON` object (use `toJSON()` from a
        prepared AppState or craft one using factories)
      - when: calling `AppState.fromJSON(json)`
      - then: resulting AppState instance contains domain instances with the
        same data as the source JSON.

      Desired assertions and steps to implement:
      1. prepare an `AppStateJSON` (roundtrip or manual)
      2. call `AppState.fromJSON(json)`
      3. assert returned `AppState` has `wizardConfiguration`, `movies`,
         `sessions`, `activities` of the expected types
      4. assert equality of representative fields between source JSON and
         reconstructed objects

    */
    const wiz = new WizardConfiguration()
    const movies = [ defaultMovie() ]
    const sessions = [ defaultSession().toMovieSession() ]
    const activities = [ defaultActivity() ]
    const original = new AppState(wiz, movies, sessions, activities)

    const json = original.toJSON()
    const reconstructed = AppState.fromJSON(json)

    expect(reconstructed.wizardConfiguration).toBeInstanceOf(WizardConfiguration)
    expect(reconstructed.movies[0]).toBeInstanceOf(Movie)
    expect(reconstructed.sessions[0]).toBeInstanceOf(MovieSession)
    expect(reconstructed.activities[0]).toBeInstanceOf(OtherActivity)

    expect(reconstructed.movies[0].id).toBe(movies[0].id)
    expect(reconstructed.sessions[0].movieId).toBe(sessions[0].movieId)
    expect(reconstructed.activities[0].id).toBe(activities[0].id)
  })


  it('should handle empty arrays and default wizard configuration', async () => {
    /*
      Goal: verify the model behaves correctly with empty lists.

      Synopsis:
      - given: an AppState with empty arrays for movies/sessions/activities
      - when: calling `toJSON()` and then `fromJSON()`
      - then: resulting JSON has empty arrays and reconstruction succeeds

      Desired assertions:
      1. `toJSON()` returns empty arrays
      2. `fromJSON()` accepts the payload and returns an AppState with empty
         arrays of the right length (zero)
    */
    const app = new AppState(new WizardConfiguration(), [], [], [])
    const json = app.toJSON()
    expect(Array.isArray(json.movies)).toBe(true)
    expect(json.movies.length).toBe(0)
    expect(json.sessions.length).toBe(0)
    expect(json.activities.length).toBe(0)

    const reconstructed = AppState.fromJSON(json)
    expect(reconstructed.movies.length).toBe(0)
    expect(reconstructed.sessions.length).toBe(0)
    expect(reconstructed.activities.length).toBe(0)
  })

  it('toJSON should not leak internal references (defensive copy)', async () => {
    /*
      Goal: ensure `toJSON()` returns new plain objects/arrays that can be
            mutated by callers without affecting the original AppState.

      Synopsis:
      - given: an AppState instance
      - when: calling `const json = appState.toJSON()` and then mutating
        `json.movies` or `json.wizardConfiguration`
      - then: `appState` internal state remains unchanged

      Desired assertions:
      1. mutate returned JSON and assert `appState` properties are unaffected
    */
    const movies = [ defaultMovie() ]
    const app = new AppState(new WizardConfiguration(), movies, [], [])
    const json = app.toJSON()
    const originalLen = app.movies.length

    // mutate returned json
    ;(json.movies as any).push({ id: 999, title: 'x', duration: 'PT0H0M', rating: 'DEFAULT' })
    expect(app.movies.length).toBe(originalLen)
  })

  it('fromJSON should validate required keys and throw on malformed input', async () => {
    /*
      Goal: decide expected behavior when `fromJSON` receives malformed JSON
            (missing keys / wrong types) and assert correct error handling.

      Synopsis:
      - given: malformed AppStateJSON (e.g. missing wizardConfiguration)
      - when: calling `AppState.fromJSON(badJson)`
      - then: method should throw or raise a clear error (implement test
        according to chosen behavior)

      Desired assertions:
      1. calling `fromJSON` with incomplete object throws an error
      2. error message/shape is descriptive enough for debugging
    */
    expect(() => AppState.fromJSON({} as any)).toThrow()
  })

})

