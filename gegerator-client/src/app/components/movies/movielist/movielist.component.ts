import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, map, mergeMap, Observable, withLatestFrom } from 'rxjs';
import { selectPlannedMovieSession } from 'src/app/ngrx/selectors/session.selectors';

import { MovieActions } from '../../../ngrx/actions/movie.actions';
import { selectMovieslist } from '../../../ngrx/selectors/movie.selectors';
import { MovieDialog } from '../moviedialog/moviedialog.component';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MovieComponent } from '../movie/movie.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-movielist',
    templateUrl: './movielist.component.html',
    styleUrls: ['./movielist.component.scss'],
    imports: [MatButton, MovieComponent, MatIcon, MatFormField, MatLabel, MatInput, AsyncPipe]
})
export class MovielistComponent implements OnInit {

  // reference to the search bar element
  searchbar = viewChild<ElementRef<HTMLDivElement>>('movielist_search');

  // sort logic: consists of a flag, and of a subject
  sorted = false
  sortedsubject = new BehaviorSubject<boolean>(false)

  // the movie filter in the template
  // will be fed into this subject.
  filtersubject = new BehaviorSubject<string>('')

  // the final model is the combination of the original model
  // + the filtering and sorting logic
  movies$ = this.store.select(selectMovieslist).pipe(
    combineLatestWith(this.filtersubject, this.sortedsubject),
    map(([allMovies, filterString, isSorted]) => {
      let finalMovies = allMovies.slice()

      finalMovies = allMovies.filter(m =>
                    m.title.toLowerCase().includes(filterString.toLowerCase() )
                  );

      if (isSorted){
        finalMovies = finalMovies.sort(
          (m1, m2) => m1.title.localeCompare(m2.title)
        )
      }
      return finalMovies
    })
  )

  constructor(private store: Store, private dialog: MatDialog) {}

  openNewMovie(): void {
    const dialogRef = this.dialog.open(MovieDialog, {
      width: '350px',
      autoFocus: "first-tabbable",
      data: { id: undefined, title: '', duration: undefined }
    });

    dialogRef.afterClosed().subscribe(newmovie => {
      if (!!newmovie){
        /*
          if a Movie model has been created:
          - create it
          - then reopen a new dialog for chain creation

          Note to myself: calling again "openNewMovie" in this block of code
          is actually not a recursive call, because this is within a callback handler
          and does not run in the same scope as the enclosing "openNewMovie" execution.
        */
        this.store.dispatch(MovieActions.create_movie({movie: newmovie}));
        this.openNewMovie();
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    // removing the subscript element that
    // material adds below the search input field by default
    // (it messes with the layout and serves no purpose here)
    // (see related CSS attempts that did not work)
    const searchbarEl = this.searchbar()?.nativeElement;
    if (! searchbarEl ){
      // should not happen
      return;
    }
    const el = searchbarEl.querySelector('.mat-mdc-form-field-subscript-wrapper');
    if (el){
      el.remove();
    }
  }

  filterMovies(evt: any): void {
    const value = evt.target.value;
    this.filtersubject.next(value);
  }

  toggleSort(): void{
    this.sorted = !this.sorted
    this.sortedsubject.next(this.sorted)
  }

}
