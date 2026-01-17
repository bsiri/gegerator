import { ChangeDetectionStrategy, Component, computed, ElementRef, Signal, signal, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { MovieActions } from '../../../ngrx/actions/movie.actions';
import { selectMovies } from '../../../ngrx/selectors/movie.selectors';
import { MovieDialog } from '../moviedialog/moviedialog.component';
import { MatButton } from '@angular/material/button';
import { MovieComponent } from '../movie/movie.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Movie } from 'src/app/models/movie.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-movielist',
    templateUrl: './movielist.component.html',
    styleUrls: ['./movielist.component.scss'],
    imports: [MatButton, MovieComponent, MatIcon, MatFormField, MatLabel, MatInput]
})
export class MovielistComponent {

  // reference to the search bar element
  searchbar = viewChild<ElementRef<HTMLDivElement>>('movielist_search');

  // sorting and filtering states, modifiable by the user
  $sorted = signal(false)
  $filterString = signal('')

  // the final movie list outputed after sorting and filtering
  $movies: Signal<Movie[]>

  constructor(private store: Store, private dialog: MatDialog) {

    const movieStore = this.store.selectSignal(selectMovies)
    this.$movies = computed(() => {
      // filter unconditionally
      const _filter = this.$filterString().toLocaleLowerCase()
      let finalMovies = movieStore().filter( m =>  
        m.title.toLocaleLowerCase().includes(_filter)
      )
      // sort if requested only
      if (this.$sorted()){
        finalMovies = finalMovies.sort(
          (m1, m2) => m1.title.localeCompare(m2.title)
        )
      }
      return finalMovies
    })

  }

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
    this.$filterString.set(value)
  }

  toggleSort(): void{
    const inverted = ! this.$sorted() 
    this.$sorted.set(inverted)
  }

}
