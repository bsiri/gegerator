import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { of, throwError, firstValueFrom } from 'rxjs';

import { OtherActivityEffects } from './activity.effects';
import { ActivitylistService } from 'src/app/services/activitylist.service';
import { ActivityActions } from '../actions/activity.actions';
import { someActivity } from 'src/_testhelpers/factories';

/**
 * Test suite skeleton for OtherActivityEffects
 *
 * Note: tests are intentionally left empty. Each test contains a block
 * comment describing the goal, the scenario (given/when/then) and the
 * desired assertions to implement.
 */

describe('OtherActivityEffects', () => {
  beforeEach(() => {
    // Synchronous setup placeholder:
    // - prepare TestBed or effect instance
    // - provide mocked ActivitylistService and Actions stream
  });

  it('should dispatch activities_reloaded when reload_activities is received', async () => {
    /*
      Goal of the test: verify that when an action `reload_activities` is
      dispatched the `reload$` effect calls `ActivitylistService.getAll()`
      and emits the `activities_reloaded` success action with the returned
      activities.

      Synopsis:
      - given: a mock Actions stream emitting `ActivityActions.reload_activities()`
        and a mocked `ActivitylistService.getAll()` returning an observable
        of activities
      - when: the effect is subscribed
      - then: the effect emits `ActivityActions.activities_reloaded({ activities })`

      Desired tests and assertions:
      1. `ActivitylistService.getAll()` is called once
      2. emitted action matches `activities_reloaded` with the same activities
      3. no additional actions are emitted
    */
    const activities = [someActivity(), someActivity()]

    const serviceMock = { getAll: vi.fn(() => of(activities)) }
    const actions$ = new Actions(of(ActivityActions.reload_activities()))

    TestBed.configureTestingModule({
      providers: [
        OtherActivityEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ActivitylistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(OtherActivityEffects)

    const emitted = await firstValueFrom(effects.reload$)

    expect(serviceMock.getAll).toHaveBeenCalledTimes(1)
    expect(emitted).toEqual(ActivityActions.activities_reloaded({ activities }))
  });

  it('should dispatch activity_created when create_activity is received', async () => {
    /*
      Goal of the test: ensure `create$` effect calls `ActivitylistService.save()`
      with the provided activity and then emits `activity_created` with the
      created activity.

      Synopsis:
      - given: Actions stream emits `ActivityActions.create_activity({ activity })`
        and `ActivitylistService.save()` returns an observable of the saved activity
      - when: the effect runs
      - then: the effect emits `ActivityActions.activity_created({ activity })`

      Desired tests and assertions:
      1. `ActivitylistService.save()` is called with the input activity
      2. emitted action is `activity_created` containing the returned activity
    */
    const input = someActivity()

    const serviceMock = { save: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(ActivityActions.create_activity({ activity: input })))

    TestBed.configureTestingModule({
      providers: [
        OtherActivityEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ActivitylistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(OtherActivityEffects)
    const emitted = await firstValueFrom(effects.create$)

    expect(serviceMock.save).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(ActivityActions.activity_created({ activity: input }))
  });

  it('should dispatch activity_updated when update_activity is received', async () => {
    /*
      Goal of the test: ensure `update$` effect calls `ActivitylistService.update()`
      and emits `activity_updated` with the updated activity.

      Synopsis:
      - given: Actions emits `ActivityActions.update_activity({ activity })`
      - when: `ActivitylistService.update()` returns an observable of the updated activity
      - then: effect emits `ActivityActions.activity_updated({ activity })`

      Desired tests and assertions:
      1. `ActivitylistService.update()` called with the provided activity
      2. emitted action equals `activity_updated` with the returned activity
    */
    const input = someActivity()
    const serviceMock = { update: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(ActivityActions.update_activity({ activity: input })))

    TestBed.configureTestingModule({
      providers: [
        OtherActivityEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ActivitylistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(OtherActivityEffects)
    const emitted = await firstValueFrom(effects.update$)

    expect(serviceMock.update).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(ActivityActions.activity_updated({ activity: input }))
  });

  it('should dispatch activity_deleted when delete_activity is received', async () => {
    /*
      Goal of the test: ensure `delete$` effect calls `ActivitylistService.delete()`
      and emits `activity_deleted` with the deleted activity.

      Synopsis:
      - given: Actions emits `ActivityActions.delete_activity({ activity })`
      - when: `ActivitylistService.delete()` returns an observable of the deleted activity
      - then: effect emits `ActivityActions.activity_deleted({ activity })`

      Desired tests and assertions:
      1. `ActivitylistService.delete()` called with the provided activity
      2. emitted action equals `activity_deleted` with the returned activity
    */
    const input = someActivity()

    const serviceMock = { delete: vi.fn(() => of(input)) }
    const actions$ = new Actions(of(ActivityActions.delete_activity({ activity: input })))

    TestBed.configureTestingModule({
      providers: [
        OtherActivityEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ActivitylistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(OtherActivityEffects)
    const emitted = await firstValueFrom(effects.delete$)

    expect(serviceMock.delete).toHaveBeenCalledWith(input)
    expect(emitted).toEqual(ActivityActions.activity_deleted({ activity: input }))
  });

  it('should propagate errors from the service through the effect', async () => {
    /*
      Goal of the test: document and assert current behavior when the service
      throws an error (there is no catchError in the effect). The effect should
      propagate the error to the stream.

      Synopsis:
      - given: Actions emits `reload_activities` and `ActivitylistService.getAll()`
        returns an observable that errors
      - when: the effect is subscribed
      - then: the effect stream should error (or the observable completes with an error)

      Desired tests and assertions:
      1. subscribing to the effect leads to an error emission
      2. optional: the error has the expected shape/message
    */
    const serviceMock = { getAll: vi.fn(() => throwError(() => new Error('boom'))) }
    const actions$ = new Actions(of(ActivityActions.reload_activities()))

    TestBed.configureTestingModule({
      providers: [
        OtherActivityEffects,
        { provide: Actions, useValue: actions$ },
        { provide: ActivitylistService, useValue: serviceMock }
      ]
    })

    const effects = TestBed.inject(OtherActivityEffects)

    await expect(firstValueFrom(effects.reload$)).rejects.toThrow('boom')
  });
});
