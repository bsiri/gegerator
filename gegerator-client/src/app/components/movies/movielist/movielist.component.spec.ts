import { describe, it, beforeEach, vi, expect } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

import { Movie } from 'src/app/models/movie.model';
import { By } from '@angular/platform-browser';
import { MovieComponent } from '../movie/movie.component';
import { MovielistComponent } from './movielist.component';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import * as factories from 'src/_testhelpers/factories';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';


describe('MovielistComponent (unit)', () => {

    let fixture: ComponentFixture<MovielistComponent>;
    let component: MovielistComponent;
    let mockStore: any;
    let mockDialog: any;

    beforeEach(() => {
        // provide a mocked store that exposes a selectSignal returning a signal
        const movieSignal = signal(MOCK_MOVIES);
        mockStore = {
            selectSignal: (_: any) => movieSignal,
            dispatch: vi.fn()
        };

        mockDialog = {
            open: vi.fn(() => ({ afterClosed: () => of(undefined) }))
        };

        TestBed.configureTestingModule({
          declarations: [],
          imports: [MovielistComponent, StubMovieComponent],
          providers: [
                { provide: Store, useValue: mockStore },
                { provide: MatDialog, useValue: mockDialog }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        });

        fixture = TestBed.createComponent(MovielistComponent);
        component = fixture.componentInstance;
    })

    it('should compute $movies for unfiltered list', async () => {
        /*
          Goal of the test: verify that the computed `$movies()` returns the
          full store list when no filter or sort is applied.
    
          Synopsis:
          - given: component initialized with a store returning `MOCK_MOVIES`
          - when: nothing (default signals)
          - then: `component.$movies()` returns all movies in original order
    
          Desired assertions (in order):
          1. `$movies()` length equals `MOCK_MOVIES.length`
          2. first and last elements are the same instances as in `MOCK_MOVIES`
        */
          const movies = component.$movies();
          expect(movies.length).toBe(MOCK_MOVIES.length);
          expect(movies[0]).toBe(MOCK_MOVIES[0]);
          expect(movies[movies.length - 1]).toBe(MOCK_MOVIES[MOCK_MOVIES.length - 1]);
    })

    it('should compute $movies for filtered list', async () => {
        /*
          Goal of the test: ensure that setting `$filterString` filters the
          `$movies()` result by title (case-insensitive substring match).
    
          Synopsis:
          - given: component with `MOCK_MOVIES`
          - when: set `component.$filterString` to a substring present in one
            movie title
          - then: `$movies()` contains only matching movies
    
          Desired assertions:
          1. `$movies()` length equals expected filtered count
          2. each returned movie title includes the filter string (lowercased)
        */
          component.$filterString.set('alpha');
          const movies = component.$movies();
          expect(movies.length).toBe(1);
          expect(movies[0].title.toLowerCase()).toContain('alpha');
    })

    it('should compute $movies for sorted list', async () => {
        /*
          Goal of the test: check that when `$sorted` is true, `$movies()` is
          returned in alphabetical order by title.
    
          Synopsis:
          - given: component with an unsorted `MOCK_MOVIES` array
          - when: set `component.$sorted` to true
          - then: `$movies()` is sorted alphabetically by `title`
    
          Desired assertions:
          1. `$movies()` titles are in ascending alphabetical order
        */
          // initial order in MOCK_MOVIES is [Beta, Gamma, Alpha]
          component.$sorted.set(true);
          const movies = component.$movies();
          const titles = movies.map(m => m.title);
          expect(titles).toEqual(['Alpha', 'Beta', 'Gamma']);
    })

});

describe('MovielistComponent (UI)', () => {

    let fixture: ComponentFixture<MovielistComponent>;
    let component: MovielistComponent;
    let mockStore: any;
    let mockDialog: any;
    let loader: HarnessLoader

    beforeEach(() => {
        // provide a mocked store that exposes a selectSignal returning a signal
        const movieSignal = signal(MOCK_MOVIES);
        mockStore = {
            selectSignal: (_: any) => movieSignal,
            dispatch: vi.fn()
        };

        mockDialog = {
            open: vi.fn(() => ({ afterClosed: () => of(factories.someMovie(), undefined) }))
        };

        TestBed.configureTestingModule({
          declarations: [],
        //   imports: [MovielistComponent, StubMovieComponent],
          imports: [MovielistComponent, MovieComponent],
          providers: [
                { provide: Store, useValue: mockStore },
                { provide: MatDialog, useValue: mockDialog }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        });

        fixture = TestBed.createComponent(MovielistComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    })

    it('should render one app-movie per movie from the store', async () => {
        /*
          Goal of the test: render the component and verify that one `app-movie`
          element exists per movie provided by the store.
    
          Synopsis:
          - given: TestBed renders `MovielistComponent` with store providing
            `MOCK_MOVIES` and a stub `app-movie` component
          - when: component is stabilized
          - then: the DOM contains exactly `MOCK_MOVIES.length` occurrences of
            the `app-movie` selector
    
          Desired assertions:
          1. count of `app-movie` elements equals `MOCK_MOVIES.length`
        */
          fixture.detectChanges();
          const elems = fixture.nativeElement.querySelectorAll('app-movie');
          expect(elems.length).toBe(MOCK_MOVIES.length);

          // confirm actual MovieComponent instances are present and bound
          const movieDebugEls = fixture.debugElement.queryAll(By.directive(MovieComponent));
          expect(movieDebugEls.length).toBe(MOCK_MOVIES.length);
          const firstComp = movieDebugEls[0].componentInstance as MovieComponent;
          expect(firstComp.movie).toBe(MOCK_MOVIES[0]);
    })

    it('should filter displayed movies when typing in the search input', async () => {
        /*
          Goal of the test: exercise the actual template bindings by typing into
          the search input and asserting the visible movie titles change.
    
          Important: this test must type text into the input element (not bypass
          the UI) to ensure event binding works.
    
          Synopsis:
          - given: rendered component with stubbed `app-movie` that outputs
            `movie.title`
          - when: user types a filter string into the search input
          - then: only movies whose titles include the filter string are visible
    
          Desired assertions:
          1. initially all movies are visible
          2. after typing, visible elements count equals expected filtered count
          3. visible text contains expected movie titles in order
        */
          fixture.detectChanges();
          const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
          expect(input).toBeTruthy();

          // type a filter that matches 'Alpha'
          input.value = 'Alpha';
          input.dispatchEvent(new KeyboardEvent('keyup'));
          fixture.detectChanges();

          const movieDebugEls = fixture.debugElement.queryAll(By.directive(MovieComponent));
          expect(movieDebugEls.length).toBe(1);
          const comp = movieDebugEls[0].componentInstance as MovieComponent;
          expect(comp.movie.title).toBe('Alpha');
    })

    it('should toggle sort when clicking the "Trier" button', async () => {
        /*
          Goal of the test: verify that clicking the sort button toggles the
          sorted state and that the displayed movie titles reorder accordingly.

          Note: Here the MovieComponent (<app-movie>) are actually rendered, 
            so we can inspect their `movie` inputs to determine the order.
    
          Synopsis:
          - given: rendered component with unsorted `MOCK_MOVIES`
          - when: user clicks the `Trier` button
          - then: the list of visible titles is sorted alphabetically
    
          Desired assertions:
          1. before click: visible titles are in original order
          2. after click: visible titles are in alphabetical order
        */
          fixture.detectChanges();
          // before click: original order (inspect child component instances)
          const beforeDebug = fixture.debugElement.queryAll(By.directive(MovieComponent));
          const beforeTitles = beforeDebug.map(d => (d.componentInstance as MovieComponent).movie.title);
          expect(beforeTitles).toEqual(['Beta', 'Gamma', 'Alpha']);

          const sortBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[title="Trier par titre"]');
          expect(sortBtn).toBeTruthy();
          sortBtn.click();
          fixture.detectChanges();

          const afterDebug = fixture.debugElement.queryAll(By.directive(MovieComponent));
          const afterTitles = afterDebug.map(d => (d.componentInstance as MovieComponent).movie.title);
          expect(afterTitles).toEqual(['Alpha', 'Beta', 'Gamma']);
    })

    it('should handle create-movie dialog sequence: create then stop', async () => {
        /*
          Goal of the test: exercise the `openNewMovie()` flow where the dialog
          first returns a Movie (causing a dispatch and reopening) and then
          returns `undefined` to stop the chain. This verifies both branches in
          a single, finite test.

          Note: Testing that way is necessary because the method is designed to
            call itself again upon successful creation, so we must control the
            dialog return values to avoid infinite loops.
    
          Synopsis:
          - given: `MatDialog.open` is mocked so the first call's `afterClosed()`
            returns `of(newMovie)`, the second returns `of(undefined)`
          - when: user triggers `openNewMovie()` (e.g., clicking the Add button)
          - then: `MovieActions.create_movie` is dispatched once and
            `MatDialog.open` was called twice
    
          Desired assertions:
          1. `store.dispatch` called once with a `create_movie` action containing
             the new movie
          2. `MatDialog.open` was invoked two times
        */
          fixture.detectChanges();

          const newMovie = factories.someMovie({ id: 99, title: 'Created' });
          // make dialog.open return a dialog that first emits newMovie, then undefined
          mockDialog.open = vi.fn()
            .mockImplementationOnce(() => ({ afterClosed: () => of(newMovie) }))
            .mockImplementationOnce(() => ({ afterClosed: () => of(undefined) }));

          const addBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="add a movie"]');
          expect(addBtn).toBeTruthy();
          addBtn.click();
          fixture.detectChanges();

          // dispatch should have been called once with a create_movie action
          expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
          const dispatchedArg = mockStore.dispatch.mock.calls[0][0];
          expect(dispatchedArg).toHaveProperty('movie');
          expect(dispatchedArg.movie.title).toBe('Created');

          // dialog.open should have been called twice (first create, then reopen)
          expect(mockDialog.open).toHaveBeenCalledTimes(2);
    })

});

// ---------------------------------------------------------------------------
// Test data and simple mocks
// ---------------------------------------------------------------------------

// simple stub for `app-movie` to allow asserting rendered titles in UI tests
@Component({ selector: 'app-movie', template: '{{ movie?.title }}' })
class StubMovieComponent {
    @Input() movie?: Movie
}

const movieAlpha = factories.someMovie({ id: 1, title: 'Alpha' });
const movieBeta = factories.someMovie({ id: 2, title: 'Beta' });
const movieGamma = factories.someMovie({ id: 3, title: 'Gamma' });

export const MOCK_MOVIES: Movie[] = [ movieBeta, movieGamma, movieAlpha ];

