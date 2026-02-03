import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovieComponent } from './movie.component';
import { Movie, MovieRatings } from 'src/app/models/movie.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MovieRatingsComponent } from '../../small-comps/movie-ratings/movie-ratings.component';
import { By } from '@angular/platform-browser';
import { MovieDialog } from '../moviedialog/moviedialog.component';
import { MovieCtxtMenu } from '../movie-ctxt-menu/movie-ctxt-menu.component';
import { GenericPurposeDialog, ConfirmOutput } from '../../genericpurposedialog/genericpurposedialog.component';
import { MovieActions } from 'src/app/ngrx/actions/movie.actions';
import { Durations } from 'src/app/models/time.utils';


describe('MovieComponent - Template', async () => {
  let fixture: ComponentFixture<MovieComponent>
  let component: MovieComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule, MatButtonModule, MatIconModule],
      providers: [{ 
        provide: Store, useValue: {} 
      }, 
        { 
          provide: MatDialog, 
          useValue: { 
            open: vi.fn(() => ({ 
              afterClosed: () => ({ 
                // callbacks return nothing in particular
                // for the Template test, we are just testing
                // interactions with the user not the backend services
                subscribe: (cb: any) => cb(undefined) 
              }) 
            })) 
          }
        }]
    })

    fixture = TestBed.createComponent(MovieComponent)
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
    await fixture.whenStable()
    const text = fixture.nativeElement.textContent as string
    expect(text).toContain(component.movie.title)
    expect(text).toContain('1h30')
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
    await fixture.whenStable()
    const dbg = fixture.debugElement.query(By.directive(MovieRatingsComponent))
    expect(dbg).toBeTruthy()
    expect(dbg.componentInstance.rating).toBe(component.movie.rating)
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
    await fixture.whenStable()
    const spy = vi.spyOn(component, 'updateMovie')
    const host = fixture.nativeElement.querySelector('mat-card') as HTMLElement
    host.dispatchEvent(new MouseEvent('dblclick'))
    fixture.detectChanges()
    expect(spy).toHaveBeenCalled()
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
    await fixture.whenStable()
    const dialog = TestBed.inject(MatDialog) as any
    const openSpy = dialog.open as any
    const spy = vi.spyOn(component, 'confirmThenDelete')

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    btn.click()
    fixture.detectChanges()

    expect(spy).toHaveBeenCalled()
    expect(openSpy).toHaveBeenCalled()
  })

})


describe('MovieComponent - Component', async () => {
  let dialogStub: any
  let storeStub: any
  let comp: MovieComponent

  beforeEach(() => {
    dialogStub = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: () => {} }), componentInstance: {} })) }
    storeStub = { dispatch: vi.fn() }
    const inj = Injector.create({ providers: [
      { provide: Store, useValue: storeStub },
      { provide: MatDialog, useValue: dialogStub }
    ] })
    comp = runInInjectionContext(inj, () => new MovieComponent())
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
    expect(comp).toBeTruthy()
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
    const updated = ({ ...sampleMovie(1), title: 'updated' } as unknown) as Movie
    const dialog = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb(updated) }) })) }
    const store = { dispatch: vi.fn() }
    const inj = Injector.create({ providers: [ { provide: Store, useValue: store }, { provide: MatDialog, useValue: dialog } ] })
    const comp = runInInjectionContext(inj, () => new MovieComponent())
    comp.movie = sampleMovie(1)

    comp.updateMovie()

    expect(dialog.open).toHaveBeenCalled()
    expect((dialog.open as any).mock.calls[0][0]).toBe(MovieDialog)
    expect(store.dispatch).toHaveBeenCalledWith(MovieActions.update_movie({ movie: updated }))
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
    const changed = ({ ...sampleMovie(1), rating: MovieRatings.HIGHEST } as unknown) as Movie
    const dialog = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb() }), componentInstance: { movie: changed } })) }
    const store = { dispatch: vi.fn() }
    const inj = Injector.create({ providers: [ { provide: Store, useValue: store }, { provide: MatDialog, useValue: dialog } ] })
    const comp = runInInjectionContext(inj, () => new MovieComponent())
    comp.movie = sampleMovie(1)

    comp.updateRating()

    expect((dialog.open as any).mock.calls[0][0]).toBe(MovieCtxtMenu)
    expect(store.dispatch).toHaveBeenCalledWith(MovieActions.update_movie({ movie: changed }))
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
    const dialog = { open: vi.fn(() => ({ afterClosed: () => ({ subscribe: (cb: any) => cb(ConfirmOutput.CONFIRM) }) })) }
    const store = { dispatch: vi.fn() }
    const inj = Injector.create({ providers: [ { provide: Store, useValue: store }, { provide: MatDialog, useValue: dialog } ] })
    const comp = runInInjectionContext(inj, () => new MovieComponent())
    comp.movie = sampleMovie(1)

    comp.confirmThenDelete()

    expect((dialog.open as any).mock.calls[0][0]).toBe(GenericPurposeDialog)
    const cfg = (dialog.open as any).mock.calls[0][1]
    expect(cfg.data.type).toBe('confirm')
    expect(store.dispatch).toHaveBeenCalledWith(MovieActions.delete_movie({ movie: comp.movie }))
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
    const mockedRect = { x: 1, y: 2, width: 10, height: 20 } as unknown as DOMRect
    ;(comp as any)._container = { nativeElement: { getBoundingClientRect: () => mockedRect } }
    expect(comp.location).toBe(mockedRect)
  })

})


// ************ Helper factories *************** //

function sampleMovie(id=10): Movie {
  return new Movie(
    id,
    'Sample Movie',
    Durations.fromString('1h30'),
    MovieRatings.DEFAULT
  )
}
