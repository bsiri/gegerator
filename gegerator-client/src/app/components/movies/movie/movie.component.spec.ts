import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { harnessHelper } from 'src/_testhelpers/harnesshelper';
import { MovieComponent } from './movie.component';
import { Movie } from 'src/app/models/movie.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MovieRatingsComponent } from '../../small-comps/movie-ratings/movie-ratings.component';
import { DurationPipe } from '../../../pipes/duration.pipe';


describe('MovieComponent - Template', async () => {
  let fixture: ComponentFixture<MovieComponent>
  let component: MovieComponent
  let loader: HarnessLoader

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule, MatButtonModule, MatIconModule],
      declarations: [MovieComponent, MovieRatingsComponent, DurationPipe],
      providers: [{ provide: Store, useValue: {} }, { provide: MatDialog, useValue: {} }]
    })

    fixture = TestBed.createComponent(MovieComponent)
    loader = TestbedHarnessEnvironment.loader(fixture)
    component = fixture.componentInstance
    component.movie = sampleMovie(1)
    fixture.detectChanges()
  })

  it('should render movie title and duration', async () => {
    /*
      Goal of the test: ensure the component template renders the movie
      data provided through the `movie` input (title + duration).

      Synopsis:
      - given: a Movie instance assigned to `component.movie`
      - when: fixture is rendered
      - then: the movie title text is present and the duration
        is displayed via the `DurationPipe`.

      Desired checks and assertions:
      1. the DOM contains the movie title string,
      2. the DOM contains the formatted duration string.
    */
  })

  it('should include the ratings component with the correct rating input', async () => {
    /*
      Goal: verify that the `app-movie-ratings` child is present and
      receives the movie.rating value.

      Synopsis:
      - given: component.movie.rating is set
      - when: template rendered
      - then: the ratings child component is present and bound to the rating

      Desired assertions:
      1. an element corresponding to the ratings component exists,
      2. its `rating` input equals the `movie.rating` value.
    */
  })

  it('should trigger updateMovie on double-click', async () => {
    /*
      Goal: ensure the (dblclick) template binding calls `updateMovie()`.

      Synopsis:
      - given: a rendered component
      - when: the host element emits a dblclick event
      - then: the `updateMovie()` method is invoked

      Desired checks:
      1. spy on component.updateMovie and assert it was called after dblclick
    */
  })

  it('should open confirm dialog when delete button clicked', async () => {
    /*
      Goal: check that clicking the delete button triggers the
      confirm deletion flow (i.e. `confirmThenDelete()` is called and a
      dialog is opened).

      Synopsis:
      - given: a rendered component with a delete button
      - when: the delete button is clicked
      - then: `confirmThenDelete()` is invoked and a dialog open call is made

      Desired assertions:
      1. spy on component.confirmThenDelete and assert invocation,
      2. spy on MatDialog.open to ensure a dialog was requested.
    */
  })

})


describe('MovieComponent - Component', async () => {
  let dialogStub: any
  let storeStub: any

  beforeEach(() => {
    dialogStub = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: (_: any) => {} }), componentInstance: {} })) }
    storeStub = { dispatch: vi.fn() }
  })

  it('should instantiate', async () => {
    /*
      Goal: basic sanity check that the component class can be instantiated
      with the required dependencies.

      Synopsis:
      - given: stubbed `MatDialog` and `Store`
      - when: constructing the `MovieComponent`
      - then: the instance is created and truthy

      Desired assertions:
      1. component instance is defined and not null.
    */
  })

  it('updateMovie() should dispatch update when dialog returns a movie', async () => {
    /*
      Goal: verify that `updateMovie()` opens the `MovieDialog`, and when
      the dialog returns updated movie data, the store receives the
      `update_movie` action with that payload.

      Synopsis:
      - given: a Movie instance and a dialog stub that returns updated data
      - when: `updateMovie()` is called
      - then: `store.dispatch` is called with the expected action

      Desired assertions:
      1. MatDialog.open was called with `MovieDialog` and correct config,
      2. store.dispatch was called with an action containing the updated movie.
    */
  })

  it('updateRating() should dispatch update when rating changed', async () => {
    /*
      Goal: ensure `updateRating()` opens the rating context dialog and
      dispatches an update if the returned movie rating differs from the
      current movie rating.

      Synopsis:
      - given: a Movie with a rating and a dialog componentInstance providing a different rating
      - when: `updateRating()` is invoked
      - then: `store.dispatch` is called with the updated movie

      Desired assertions:
      1. MatDialog.open called with `MovieCtxtMenu`,
      2. store.dispatch called when the rating changed.
    */
  })

  it('confirmThenDelete() should dispatch delete when confirmed', async () => {
    /*
      Goal: verify that `confirmThenDelete()` opens a confirmation dialog
      and dispatches a delete action when the user confirms.

      Synopsis:
      - given: a Movie and a MatDialog stub returning a confirm result
      - when: `confirmThenDelete()` is called
      - then: `store.dispatch` is called with the delete action

      Desired assertions:
      1. MatDialog.open called with `GenericPurposeDialog` and type `confirm`,
      2. store.dispatch called with `MovieActions.delete_movie` when confirmed.
    */
  })

  it('location getter should return bounding rect of container', async () => {
    /*
      Goal: ensure the `location` getter returns a DOMRect from the
      underlying `_container` ElementRef.

      Synopsis:
      - given: a component instance with a mocked `_container.nativeElement.getBoundingClientRect`
      - when: accessing `component.location`
      - then: the returned value matches the mocked DOMRect

      Desired assertions:
      1. calling the getter returns the object returned by the mocked method.
    */
  })

})


// ************ Helper factories *************** //

function sampleMovie(id?: number): Movie {
  return ({
    id,
    title: 'Sample Movie',
    duration: { hours: 1, minutes: 30 },
    rating: 3
  } as unknown) as Movie
}
