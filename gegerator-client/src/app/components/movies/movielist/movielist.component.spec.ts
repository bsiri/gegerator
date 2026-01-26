import { describe, it, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';

import { Movie } from 'src/app/models/movie.model';
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
            declarations: [MovielistComponent, StubMovieComponent],
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
            declarations: [MovielistComponent, StubMovieComponent],
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
    })

    it('should toggle sort when clicking the "Trier" button', async () => {
        /*
          Goal of the test: verify that clicking the sort button toggles the
          sorted state and that the displayed movie titles reorder accordingly.
    
          Synopsis:
          - given: rendered component with unsorted `MOCK_MOVIES`
          - when: user clicks the `Trier` button
          - then: the list of visible titles is sorted alphabetically
    
          Desired assertions:
          1. before click: visible titles are in original order
          2. after click: visible titles are in alphabetical order
        */
    })

    it('should handle create-movie dialog sequence: create then stop', async () => {
        /*
          Goal of the test: exercise the `openNewMovie()` flow where the dialog
          first returns a Movie (causing a dispatch and reopening) and then
          returns `undefined` to stop the chain. This verifies both branches in
          a single, finite test.
    
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

