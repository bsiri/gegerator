import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { Actions } from '@ngrx/effects'
import { of, throwError, firstValueFrom } from 'rxjs'

import { MovieEffects } from './movie.effects'
import { MovielistService } from 'src/app/services/movielist.service'
import { MovieActions } from '../actions/movie.actions'
import { someMovie } from 'src/_testhelpers/factories'

/**
 * Test suite skeleton for MovieEffects
 *
 * Each test remains empty and contains a block comment describing the
 * goal, scenario (given/when/then) and desired assertions to implement.
 */

describe('MovieEffects', () => {
  beforeEach(() => {
    // Synchronous setup placeholder:
    // - prepare TestBed or effect instance
    // - provide mocked MovielistService and Actions stream
  })

  it('should reload movies and emit movies_reloaded', async () => {
    /*
      Goal: when `reload_movies` is dispatched, `reload$` should call
      `MovielistService.getAll()` and emit `MovieActions.movies_reloaded({movies})`.

      Synopsis:
      - given: Actions emits `MovieActions.reload_movies()` and
        `MovielistService.getAll()` returns an observable of movies
      - when: the effect is subscribed
      - then: the effect emits `movies_reloaded` with the returned list

      Desired assertions:
      1. `MovielistService.getAll()` called once
      2. emitted action equals `movies_reloaded` with returned movies
    */
    const movies = [someMovie(), someMovie()]
    const serviceMock = { getAll: vi.fn(() => of(movies)) }
    const actions$ = new Actions(of(MovieActions.reload_movies()))

    TestBed.configureTestingModule({
      providers: [
        MovieEffects,
        { provide: Actions, useValue: actions$ },
        { provide: MovielistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieEffects)
    const emitted = await firstValueFrom(effects.reload$)

    expect(serviceMock.getAll).toHaveBeenCalledTimes(1)
    expect(emitted).toEqual(MovieActions.movies_reloaded({ movies }))
  })

  it('should create a movie and emit movie_created', async () => {
    /*
      Goal: `create$` should call `MovielistService.save(movie)` and emit
      `MovieActions.movie_created({movie})` with the saved movie.

      Synopsis:
      - given: Actions emits `MovieActions.create_movie({ movie })` and
        `MovielistService.save()` returns the created movie
      - when: the effect runs
      - then: emitted action is `movie_created` with returned movie

      Desired assertions:
      1. `MovielistService.save()` called with provided movie
      2. emitted `movie_created` contains the returned movie
    */
    const input = someMovie()
    const serviceMock = { save: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(MovieActions.create_movie({ movie: input })))

    TestBed.configureTestingModule({
      providers: [
        MovieEffects,
        { provide: Actions, useValue: actions$ },
        { provide: MovielistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieEffects)
    const emitted = await firstValueFrom(effects.create$)

    expect(serviceMock.save).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(MovieActions.movie_created({ movie: input }))
  })

  it('should update a movie and emit movie_updated', async () => {
    /*
      Goal: `update$` should call `MovielistService.update(movie)` and emit
      `MovieActions.movie_updated({movie})` with the response.

      Synopsis:
      - given: Actions emits `MovieActions.update_movie({ movie })` and
        `MovielistService.update()` returns the updated movie
      - when: the effect runs
      - then: emitted action equals `movie_updated` with returned movie

      Desired assertions:
      1. `MovielistService.update()` called with provided movie
      2. emitted `movie_updated` contains the returned movie
      
      Note: MovielistService.update() do not actually update anything; it just
      sends the provided to the backend server and returns the same movie echoed
      back. Therefore, the returned movie is expected to be identical to the
      input movie.
    */
    const input = someMovie()
    const serviceMock = { update: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(MovieActions.update_movie({ movie: input })))

    TestBed.configureTestingModule({
      providers: [
        MovieEffects,
        { provide: Actions, useValue: actions$ },
        { provide: MovielistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieEffects)
    const emitted = await firstValueFrom(effects.update$)

    expect(serviceMock.update).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(MovieActions.movie_updated({ movie: input }))
  })

  it('should delete a movie and emit movie_deleted', async () => {
    /*
      Goal: `delete$` should call `MovielistService.delete(movie)` and emit
      `MovieActions.movie_deleted({movie})` with the deleted movie.

      Synopsis:
      - given: Actions emits `MovieActions.delete_movie({ movie })` and
        `MovielistService.delete()` returns the deleted movie
      - when: the effect runs
      - then: emitted action equals `movie_deleted` with the deleted movie

      Desired assertions:
      1. `MovielistService.delete()` called with provided movie
      2. emitted `movie_deleted` contains the returned movie
    */
    const input = someMovie()
    const serviceMock = { delete: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(MovieActions.delete_movie({ movie: input })))

    TestBed.configureTestingModule({
      providers: [
        MovieEffects,
        { provide: Actions, useValue: actions$ },
        { provide: MovielistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieEffects)
    const emitted = await firstValueFrom(effects.delete$)

    expect(serviceMock.delete).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(MovieActions.movie_deleted({ movie: input }))
  })

  it('should propagate service errors for each effect', async () => {
    /*
      Goal: document behavior when the MovielistService methods error. Effects
      currently have no catchError; errors should propagate to the effect stream.

      Synopsis:
      - given: actions emit and service methods throw
      - when: effect subscribed
      - then: the observable errors

      Desired assertions:
      1. subscribing to each effect when the service errors results in an error
      2. optional: error messages match service errors
    */
    const serviceMock = { getAll: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(MovieActions.reload_movies()))

    TestBed.configureTestingModule({
      providers: [
        MovieEffects,
        { provide: Actions, useValue: actions$ },
        { provide: MovielistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(MovieEffects)

    await expect(firstValueFrom(effects.reload$)).rejects.toThrow('boom')
  })
})
