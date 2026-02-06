import { describe, it, beforeEach, vi, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TurboSessionDialog } from './turbo-session-dialog.component';
import { someMovie } from 'src/_testhelpers/factories'
import { Movie } from 'src/app/models/movie.model';
import { Theater, Day, Theaters, Days } from 'src/app/models/referential.data';
import { Time } from 'src/app/models/time.model';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { harnessHelper } from 'src/_testhelpers/harnesshelper';

// Note: these tests are skeletons only. Each `it` is async (except `beforeEach`) and
// contains a descriptive block comment explaining the goal, setup, actions and assertions.

describe('TurboSessionDialog — UI', () => {
  // Shared fixtures / mocks for UI tests
  let fixture: ComponentFixture<TurboSessionDialog>
  let component: TurboSessionDialog
  let mockStore: any
  let mockDialogRef: any
  let loader: HarnessLoader
  // per-suite movies array to avoid mutating module-level shared fixtures
  let movies: Movie[]

  beforeEach(async () => {
    // baseline mocks
    mockDialogRef = { close: vi.fn() }
    movies = []
    mockStore = {
      dispatch: vi.fn(),
      // selectSignal returns a signal over the per-suite movies array
      selectSignal: vi.fn(() => signal<Movie[]>(movies))
    }

    await TestBed.configureTestingModule({
      imports: [TurboSessionDialog],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(TurboSessionDialog)
    component = fixture.componentInstance
    loader = TestbedHarnessEnvironment.loader(fixture)
  })

  it('should create the component and initial state', async () => {
    /*
      Goal of the test: ensure the component boots with an empty input and submit disabled.

      Synopsis:
      - given: a freshly created `TurboSessionDialog` component instance
      - when: no input has been provided
      - then: `canSubmit` is false and the submit button in the template is disabled

      Desired tests and assertions:
      1. component instance is defined
      2. `component.canSubmit` is false
      3. submit button element has `disabled` attribute (UI assertion)
    */
    // implementation: assertions below
    const helper = harnessHelper(loader)
    expect(component).toBeTruthy()

    // wait for Angular change detection and any effects to stabilise
    await fixture.whenStable()

    // logical assertion
    expect(component.canSubmit).toBe(false)

    // template assertion: submit button is disabled
    const submitBtn = await helper.button('tsd-submit')
    expect(await submitBtn.isDisabled()).toBe(true)
  });

  it('should enable submit when parsed input is fully matched', async () => {
    /*
      Goal of the test: typing a full, non-ambiguous input enables the submit button.

      Synopsis:
      - given: the component rendered and `availableMovies` populated with movies
      - when: the user types a raw input that should parse to a single movie, theater, day and time
      - then: `canSubmit` becomes true and submit button becomes enabled

      Desired tests and assertions:
      1. simulate user typing into the input element (use DOM typing events)
      2. assert `component.canSubmit` is true
      3. assert the submit button element is enabled
    */
    // Arrange: add a movie that will match the token 'alien'
    const movie = someMovie({ title: 'Alien' })
    movies.length = 0
    movies.push(movie)

    // Act: set the form control value which triggers the parser subscription
    component.inputControl.setValue('Casino Vendredi 935 Alien')
    // wait for the form control and parser to stabilise
    await fixture.whenStable()

    // Assert: component logic and template
    expect(component.canSubmit).toBe(true)
    const helper = harnessHelper(loader)
    const submitBtn = await helper.button('tsd-submit')
    expect(submitBtn).toBeTruthy()
    expect(await submitBtn.isDisabled()).toBe(false)
  });

  it('should emit `created` and reset input on confirm', async () => {
    /*
      Goal of the test: clicking confirm when `canSubmit` is true emits a PlannedMovieSession
      and resets the input control.

      Synopsis:
      - given: component in a fully matched state (either by typing or by setting the state)
      - when: user clicks the confirm/submit button
      - then: component.created emits a `PlannedMovieSession` with matched fields and input cleared

      Desired tests and assertions:
      1. subscribe to `component.created` and capture the emitted value
      2. click the confirm button
      3. assert the emitted value is an instance of `PlannedMovieSession` with expected fields
      4. assert the `inputControl` value is reset/empty
    */
    // Arrange: create a matching movie and populate per-suite movies
    const movie = someMovie({ title: 'Alien' })
    movies.length = 0
    movies.push(movie)

    // prepare the input so the parser will produce a full match
    component.inputControl.setValue('Casino Vendredi 935 Alien')
    await fixture.whenStable()

    // subscribe to the output
    let emitted: PlannedMovieSession | undefined = undefined
    component.created.subscribe(v => emitted = v)

    // Act: click the submit button
    const helper = harnessHelper(loader)
    const submitBtn = await helper.button('tsd-submit')
    await submitBtn.click()
    await fixture.whenStable()

    // Assert: emission happened and contains expected values
    expect(emitted).toBeTruthy()
    // movie instance should be the same object pushed into movies
    expect(emitted!.movie).toBe(movie)
    expect(emitted!.theater).toBe(Theaters.CASINO)
    expect(emitted!.day).toBe(Days.FRIDAY)
    expect(emitted!.startTime).toEqual(new Time(9,35))

    // input control must be reset to empty string
    expect(component.inputControl.value).toBe('')
    expect(component.canSubmit).toBe(false) // also back to non-submittable state
    expect(await submitBtn.isDisabled()).toBe(true) // submit button disabled again
  });

  it('should call dialogRef.close() on close', async () => {
    /*
      Goal of the test: clicking the close/cancel button calls `dialogRef.close()`.

      Synopsis:
      - given: a component with a mocked `dialogRef` injected
      - when: the user clicks the close button (or calls the close method)
      - then: `dialogRef.close()` is called once

      Desired tests and assertions:
      1. spy/mock `dialogRef.close`
      2. trigger the close action (UI click or `component.close()`)
      3. assert `dialogRef.close` was called
    */
    // ensure template is stable and rendered
    await fixture.whenStable()

    // Act: click the cancel button in the template
    const helper = harnessHelper(loader)
    await helper.clickByTestId('tsd-cancel')

    // wait for any effects
    await fixture.whenStable()

    // Assert: our mocked dialogRef.close was called
    expect(mockDialogRef.close).toHaveBeenCalledOnce()
  });

  it('should render correct summary panel for a full unambiguous input', async () => {
    /*
      Goal of the test: end-to-end UI test verifying the summary panel shows the labels
      computed from a fully matched input.

      Synopsis:
      - given: component rendered with available movies/theaters/days in the store
      - when: user types an input that yields a single match per field and parsing finishes
      - then: the summary DOM panel displays `movieLabel`, `theaterLabel`, `dayLabel` and `timeLabel`

      Important: this test must interact with the UI (type into input, wait for change detection)

      Desired tests and assertions:
      1. type the input into the text input element
      2. wait for the template to update
      3. assert the summary panel contains the expected text values for each label
    */
    // Arrange: ensure a matching movie exists
    const movie = someMovie({ title: 'Alien' })
    movies.length = 0
    movies.push(movie)

    // ensure initial rendering
    await fixture.whenStable()

    // Use harness to simulate user typing (realistic key events)
    const helper = harnessHelper(loader)
    const input = await helper.text('tsd-input input')
    await input.setValue('Casino Vendredi 935 Alien')
    await fixture.whenStable()

    // Assert: summary panel shows expected labels
    const values: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.turbo-summary-value')
    expect(values.length).toBe(4)
    const [movieLabelEl, theaterLabelEl, dayLabelEl, timeLabelEl] = Array.from(values)
    expect(movieLabelEl.textContent!.trim()).toBe('Alien')
    expect(theaterLabelEl.textContent!.trim()).toBe('Casino')
    expect(dayLabelEl.textContent!.trim()).toBe('Vendredi')
    expect(timeLabelEl.textContent!.trim()).toBe('09h35')
  });

  it('Labelling & status logic (direct state set)', async () => {
    /*
      Goal of the test: validate `movieLabel`/`theaterLabel`/`dayLabel`/`timeLabel` and
      the corresponding `*Status` getters for several edge cases by directly setting the component state.

      Synopsis:
      - given: a component instance (no DOM interaction required)
      - when: manually set `component['state']` (or use provided setter) to states representing:
        a) single match in a field (ok)
        b) zero candidates for a field (missing)
        c) multiple candidates for a field (ambiguous)
      - then: labels return expected strings (exact label, 'Manquant', or 'Ambigu: ...') and
        statuses return `ok`/`missing`/`ambiguous` accordingly

      Desired tests and assertions:
      1. set state with a single day candidate: assert `dayStatus === 'ok'` and `dayLabel` equals day name
      2. set state with no theater candidates: assert `theaterStatus === 'missing'` and `theaterLabel` === 'Manquant'
      3. set state with multiple movie candidates: assert `movieStatus === 'ambiguous'` and `movieLabel` starts with 'Ambigu:'
      4. test label truncation for `movieLabel` when many candidates exist (only first two shown)
    */

    // Arrange the data
    const m1 = someMovie({ title: 'ABC' })
    const m2 = someMovie({ title: 'ABCDEF' })
    const m3 = someMovie({ title: 'ABCDEFGH' })
    movies.length = 0
    movies.push(m1, m2, m3)

    // Now simulate user input: should match Friday (vendredi), ambiguity on the movies, and 
    // nothing for the rest.
    const helper = harnessHelper(loader)
    const inputField = await helper.text('tsd-input input')
    await inputField.setValue("ven abc")
    await fixture.whenStable()

    // Day ok
    expect(component.dayStatus).toBe('ok')
    expect(component.dayLabel).toBe('Vendredi')

    // Theater missing
    expect(component.theaterStatus).toBe('missing')
    expect(component.theaterLabel).toBe('Manquant')

    // Movie ambiguous and truncation
    expect(component.movieStatus).toBe('ambiguous')
    const ml = component.movieLabel
    expect(ml.startsWith('Ambigu:')).toBe(true)
    expect(ml).toContain('ABC')
    expect(ml).toContain('ABCDEF')
    expect(ml).not.toContain('ABCDEFGH')
  });
});


describe('TurboSessionDialog — Parser', () => {
  let fixture: ComponentFixture<TurboSessionDialog>
  let component: TurboSessionDialog
  // per-suite movies array to avoid mutating module-level shared fixtures
  let movies: Movie[]

  beforeEach(async () => {
    movies = []
    // Create a minimal TestBed to instantiate the component and call the private method
    await TestBed.configureTestingModule({
      imports: [TurboSessionDialog],
      providers: [
        { provide: Store, useValue: { selectSignal: vi.fn(() => signal<Movie[]>(movies)) } },
        { provide: MatDialogRef, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TurboSessionDialog);
    component = fixture.componentInstance;
  });

  it('tokenize: should split input into tokens and handle empty input', async () => {
    /*
      Goal of the test: validate the tokenization logic.

      Synopsis:
      - given: several raw input strings
      - when: calling the tokenizer (via `parseInput` or the private method)
      - then: tokens are split on whitespace and commas, trimmed, and empty tokens removed

      Desired tests and assertions:
      1. empty string -> []
      2. 'a,b   c' -> ['a','b','c']
      3. leading/trailing spaces are trimmed
    */

    const exposed = exposePrivate(component);

    // Empty input -> []
    expect(exposed.tokenize('')).toEqual([]);

    // Comma and whitespace splitting
    expect(exposed.tokenize('a,b   c')).toEqual(['a', 'b', 'c']);

    // Leading/trailing spaces trimmed and empty tokens removed
    expect(exposed.tokenize('  foo  ')).toEqual(['foo']);
    expect(exposed.tokenize(' , , ')).toEqual([]);
  });

  it('parseTimeToken: should parse various time formats and reject invalid ones', async () => {
    /*
      Goal of the test: ensure `parseTimeToken` understands multiple formats and rejects invalid/out-of-range values.

      Synopsis:
      - given: tokens like '14h30', '1430', '905', '11', and invalid examples
      - when: parsing each token
      - then: valid tokens produce correct `Time` objects; invalid/out-of-range return null

      Desired tests and assertions:
      1. '14h30' -> Time(14,30)
      2. '1430' -> Time(14,30)
      3. '905' -> Time(9,5)
      4. '11' -> Time(11,0)
      5. invalids ('14h3','25','9999','abc') -> null
      6. times outside `PLANNABLE_EVENT_TIME_INTERVAL` -> null
    */
    const exposed = exposePrivate(component);

    // Valid formats
    expect(exposed.parseTimeToken('14h30')).toEqual(new Time(14,30));
    expect(exposed.parseTimeToken('1430')).toEqual(new Time(14,30));
    expect(exposed.parseTimeToken('905')).toEqual(new Time(9,5));
    expect(exposed.parseTimeToken('11')).toEqual(new Time(11,0));

    // Invalid formats
    expect(exposed.parseTimeToken('14h3')).toBeNull();
    expect(exposed.parseTimeToken('25')).toBeNull();
    expect(exposed.parseTimeToken('9999')).toBeNull();
    expect(exposed.parseTimeToken('abc')).toBeNull();

    // matchTimeToken enforces PLANNABLE_EVENT_TIME_INTERVAL
    // a valid parse but out of plannable interval should return []
    expect(exposed.parseTimeToken('03h00')).toEqual(new Time(3,0));
    expect(exposed.matchTimeToken('03h00')).toEqual([]);

    // and a valid in-range time returns a single-element array
    expect(exposed.matchTimeToken('09h05')).toEqual([new Time(9,5)]);
  });

  it('matchToken: should return correct candidate lists (none, single, many)', async () => {
    /*
      Goal of the test: verify matching against candidate lists using the provided labeler/keyer.

      We exercise three categories (movies, theaters, days) and for each ensure:
      - token matching nothing -> []
      - token matching a single candidate -> [candidate]
      - token matching multiple candidates -> array of matching unique candidates
    */

    const exposed = exposePrivate(component);

    // Movies: none / single / many
    const m1 = someMovie({ id: 11, title: 'Star' });
    const m2 = someMovie({ id: 12, title: 'Star Wars' });
    const m3 = someMovie({ id: 13, title: 'Other' });
    const moviesArr = [m1, m2, m3];

    // keyers/labelers
    const keyerMovie = (m: Movie) => String(m.id);
    const labelerMovie = (m: Movie) => m.title;
    const keyerTheater = (t: Theater) => t.key;
    const labelerTheater = (t: Theater) => t.name;
    const keyerDay = (d: Day) => d.key;
    const labelerDay = (d: Day) => d.name;

    expect(exposed.matchToken('zzz', moviesArr, labelerMovie, keyerMovie)).toEqual([]);
    expect(exposed.matchToken('star', moviesArr, labelerMovie, keyerMovie)).toEqual([m1, m2]);

    // Theaters: none / single / many
    const theaters = Theaters.enumerate();
    expect(exposed.matchToken('zzz', theaters, labelerTheater, keyerTheater)).toEqual([]);
    expect(exposed.matchToken('cas', theaters, labelerTheater, keyerTheater)).toEqual([Theaters.CASINO]);
    // token 'a' should match multiple theaters (Espace Lac, Casino, Paradiso)
    const thMatches = exposed.matchToken('a', theaters, labelerTheater, keyerTheater);
    expect(thMatches.length).toBeGreaterThan(1);

    // Days: none / single / many
    const days = Days.enumerate();
    expect(exposed.matchToken('zzz', days, labelerDay, keyerDay)).toEqual([]);
    expect(exposed.matchToken('vend', days, labelerDay, keyerDay)).toEqual([Days.FRIDAY]);
    // token 'e' should match multiple day names (Mercredi, Jeudi, Vendredi, ...)
    const dayMatches = exposed.matchToken('e', days, labelerDay, keyerDay);
    expect(dayMatches.length).toBeGreaterThan(1);
  });

  it('per-field matching: each field should handle no match / single match / ambiguous', async () => {
    /*
      Goal of the test: for movie, theater, day and time fields, ensure the parser returns
      an empty array when no match, a single-element array when exact match, and multi-element array when ambiguous.

      We use `buildTokenMatchCandidates` to obtain per-field matches for given tokens.
    */

    const exposed = exposePrivate(component);

    // Movies fixtures
    const ma = someMovie({ id: 21, title: 'Alpha' });
    const mb = someMovie({ id: 22, title: 'AlphaBeta' });
    const mc = someMovie({ id: 23, title: 'Gamma' });
    movies.length = 0
    movies.push(ma, mb, mc)

    // none
    let res = exposed.buildTokenMatchCandidates('zzz', movies);
    expect(res.movie.length).toBe(0);

    // single (gamma)
    res = exposed.buildTokenMatchCandidates('gamma', movies);
    expect(res.movie.length).toBe(1);
    expect(res.movie[0]).toBe(mc);

    // many (alpha -> matches Alpha and AlphaBeta)
    res = exposed.buildTokenMatchCandidates('alpha', movies);
    expect(res.movie.length).toBeGreaterThan(1);

    // Theaters: none / single / many
    res = exposed.buildTokenMatchCandidates('zzz', movies);
    expect(res.theater.length).toBe(0);

    res = exposed.buildTokenMatchCandidates('cas', movies);
    expect(res.theater.length).toBe(1);
    expect(res.theater[0]).toBe(Theaters.CASINO);

    res = exposed.buildTokenMatchCandidates('a', movies);
    expect(res.theater.length).toBeGreaterThan(1);

    // Days: none / single / many
    res = exposed.buildTokenMatchCandidates('zzz', movies);
    expect(res.day.length).toBe(0);

    res = exposed.buildTokenMatchCandidates('vend', movies);
    expect(res.day.length).toBe(1);
    expect(res.day[0]).toBe(Days.FRIDAY);

    res = exposed.buildTokenMatchCandidates('e', movies);
    expect(res.day.length).toBeGreaterThan(1);

    // Time: valid in-range -> single element, invalid/out-of-range -> []
    res = exposed.buildTokenMatchCandidates('09h00', movies);
    expect(res.time.length).toBe(1);
    expect(res.time[0]).toEqual(new Time(9,0));

    res = exposed.buildTokenMatchCandidates('03h00', movies);
    expect(res.time.length).toBe(0);
    expect(res.time).toEqual([]);
  });

  it('buildTokenMatchCandidates: should collect matches for all fields for a token', async () => {
    /*
      Goal of the test: `buildTokenMatchCandidates` returns an object with movie/theater/day/time arrays reflecting matches.

      Synopsis:
      - given: known token and small referential datasets
      - when: call `buildTokenMatchCandidates(token, movies)`
      - then: returned object has `token` property and arrays for each field with expected lengths

      Desired tests and assertions:
      1. returned object includes the original token
      2. movie/theater/day/time arrays contain the expected matches
    */
    const exposed = exposePrivate(component);

    // prepare movies
    movies.length = 0
    const mv = someMovie({ title: 'Alien' })
    movies.push(mv)

    // token matching a movie
    const r1 = exposed.buildTokenMatchCandidates('Alien', movies)
    expect(r1.token).toBe('Alien')
    expect(r1.movie.length).toBe(1)
    expect(r1.movie[0]).toBe(mv)
    expect(r1.theater.length).toBe(0)
    expect(r1.day.length).toBe(0)
    expect(r1.time.length).toBe(0)

    // token matching a theater
    const r2 = exposed.buildTokenMatchCandidates('Casino', movies)
    expect(r2.token).toBe('Casino')
    expect(r2.theater.length).toBe(1)
    expect(r2.theater[0]).toBe(Theaters.CASINO)

    // token matching a time
    const r3 = exposed.buildTokenMatchCandidates('09h35', movies)
    expect(r3.token).toBe('09h35')
    expect(r3.time.length).toBe(1)
    expect(r3.time[0]).toEqual(new Time(9,35))
  });

  it('matchedFieldnames: prefers unique-field matches and always includes null', async () => {
    /*
      Goal of the test: validate prioritisation rules for `matchedFieldnames`.

      We create synthetic TokenMatchCandidates objects to exercise two scenarios:
      - unique-field: one field has exactly one candidate -> only that field + null returned
      - ambiguous-fields: multiple fields have >1 candidates and none have exactly one -> all non-empty fields + null returned
    */

    const exposed = exposePrivate(component);

    // unique-field scenario: only 'movie' has exactly one candidate
    const uniqueTokenMatches = {
      token: 't1',
      movie: [someMovie({ id: 101, title: 'X' })],
      theater: [],
      day: [],
      time: []
    } as any;

    const uniqueResult = exposed.matchedFieldnames(uniqueTokenMatches);
    expect(uniqueResult).toEqual(['movie', null]);

    // ambiguous-fields scenario: movie and theater have multiple candidates, none has exactly one
    const ambiguousTokenMatches = {
      token: 't2',
      movie: [someMovie({ title: 'A' }), someMovie({ title: 'B' })],
      theater: [Theaters.CASINO, Theaters.PARADISO],
      day: [],
      time: []
    } as any;

    const ambResult = exposed.matchedFieldnames(ambiguousTokenMatches);
    // should contain movie and theater (in FIELD_NAMES order) and always end with null
    expect(ambResult).toContain('movie');
    expect(ambResult).toContain('theater');
    expect(ambResult[ambResult.length - 1]).toBeNull();
  });

  it('should compute the scode for a CandidatesAcumulator in various situations', async () => {
    /*
      Goal of the test: verify the scoring computation and comparisons used to pick best assignment.

      Strategy:
      - create accumulators via `pickBestAssignment([])` (returns an empty accumulator)
      - use `addToField` to craft states with controlled map sizes
      - assert `.score` counts and compare scores with `isBetterScore`
    */

    const exposed = exposePrivate(component);
    const newAccumulator = () => exposed.pickBestAssignment([]);

    // base accumulator with no matches
    const acc = newAccumulator()
    // total counts the number of candidate entries across all fields
    expect(acc.score).toEqual({ ok: 0, missing: 4, ambiguous: 0, totalMatches: 0 });

    // add a single ok field (movie)
    acc.addToField('movie', [someMovie()]);
    expect(acc.score).toEqual({ ok: 1, missing: 3, ambiguous: 0, totalMatches: 1 });

    // add an ambiguous field (theater)
    acc.addToField('theater', [Theaters.CASINO, Theaters.PARADISO]);
    expect(acc.score).toEqual({ ok: 1, missing: 2, ambiguous: 1, totalMatches: 3 });

    // add another ok field (day)
    acc.addToField('day', [Days.WEDNESDAY]);
    expect(acc.score).toEqual({ ok: 2, missing: 1, ambiguous: 1, totalMatches: 4 });


  });

  it('CandidatesAccumulator score getter and isBetterScore rules', async () => {
    /*
      Goal of the test: verify the scoring computation and comparisons used to pick best assignment.

      Strategy:
      - create accumulators via `pickBestAssignment([])` (returns an empty accumulator)
      - use `addToField` to craft states with controlled map sizes
      - assert `.score` counts and compare scores with `isBetterScore`
    */

    const exposed = exposePrivate(component);
    const newAccumulator = () => exposed.pickBestAssignment([]);

    // base accumulators
    const OK3 = newAccumulator()

    ////// Testing precedence of the 'ok' count in the score (more ok is better) //////

    // add movie, theater, day -> 3 ok, time missing
    OK3.addToField('movie', [someMovie({ id: 301, title: 'M' })]);
    OK3.addToField('theater', [Theaters.CASINO]);
    OK3.addToField('day', [Days.FRIDAY]);

    const O3score = OK3.score;
    expect(O3score.ok).toBe(3);
    expect(O3score.missing).toBe(1);

    // Create another accumulator with fewer ok (2 ok)
    const OK2 = newAccumulator()
    OK2.addToField('movie', [someMovie({ id: 302, title: 'X' })]);
    OK2.addToField('theater', [Theaters.CASINO]);

    expect(exposed.isBetterScore(O3score, OK2.score)).toBe(true);

    // Same ok but more missing -> worse
    const c = newAccumulator()
    c.addToField('movie', [someMovie({ id: 303, title: 'Y' })]);
    c.addToField('theater', [Theaters.CASINO]);
    c.addToField('day', [Days.FRIDAY]);

    const d = newAccumulator()
    d.addToField('movie', [someMovie({ id: 304, title: 'Z' })]);
    // d has fewer ok (1), more missing -> c better than d
    expect(exposed.isBetterScore(c.score, d.score)).toBe(true);

    // Same ok & missing but different ambiguous -> fewer ambiguous is better
    const e = newAccumulator()
    e.addToField('movie', [someMovie({ id: 401 })]);
    e.addToField('theater', [Theaters.CASINO]);
    // make day ambiguous (2 entries)
    e.addToField('day', [Days.FRIDAY, Days.SATURDAY]);

    const f = newAccumulator()
    f.addToField('movie', [someMovie({ id: 402 })]);
    f.addToField('theater', [Theaters.CASINO]);
    // day single (less ambiguous)
    f.addToField('day', [Days.FRIDAY]);

    expect(exposed.isBetterScore(f.score, e.score)).toBe(true);

    // Tie resolved by smaller total
    const g = newAccumulator()
    g.addToField('movie', [someMovie({ id: 501 })]);
    g.addToField('theater', [Theaters.CASINO]);
    g.addToField('day', [Days.FRIDAY]);
    // total = 3

    const h = newAccumulator()
    h.addToField('movie', [someMovie({ id: 502 })]);
    h.addToField('theater', [Theaters.CASINO, Theaters.PARADISO]);
    h.addToField('day', [Days.FRIDAY]);
    // total = 4 (one ambiguous)

    expect(exposed.isBetterScore(g.score, h.score)).toBe(true);
  });

});


// Sample fixtures and factories for tests (placeholders).
// Use the project's entity factory helpers (`_testhelpers/factories.ts`) when implementing tests.


function exposePrivate(component: TurboSessionDialog) {
  return {
    tokenize: (component as any).tokenize.bind(component),
    parseTimeToken: (component as any).parseTimeToken.bind(component),
    matchTimeToken: (component as any).matchTimeToken.bind(component),
    matchToken: (component as any).matchToken.bind(component),
    buildTokenMatchCandidates: (component as any).buildTokenMatchCandidates.bind(component),
    matchedFieldnames: (component as any).matchedFieldnames.bind(component),
    pickBestAssignment: (component as any).pickBestAssignment.bind(component),
    isBetterScore: (component as any).isBetterScore.bind(component)
  }
}
