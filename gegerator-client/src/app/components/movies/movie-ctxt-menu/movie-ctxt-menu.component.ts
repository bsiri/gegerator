import { ChangeDetectionStrategy, Component, computed, Signal, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange, MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { Store } from '@ngrx/store';
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive';
import { Movie, MovieRatings } from 'src/app/models/movie.model';
import { selectPlannedMovieSessions } from 'src/app/ngrx/selectors/session.selectors';
import { ContextMenuDirective } from '../../../directives/context-menu.directive';
import { EventLinkComponent } from '../../small-comps/event-link/event-link.component';
import { OrderByComparablePipe } from '../../../pipes/order-by-comparable.pipe';
import { PlannedMovieSession } from 'src/app/models/session.model';

/**
 * Menu that allow to select ratings for movies.
 * 
 * As a secondary function, it also displays links to 
 * all sessions that plan that movie.
 * 
 * Because it only closes by 'onBlur', the result should be 
 * read straight from the MatDialogRef.componentInstance
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-movie-ctxt-menu',
    templateUrl: './movie-ctxt-menu.component.html',
    styleUrls: ['./movie-ctxt-menu.component.scss'],
    imports: [ContextMenuDirective, MatRadioGroup, MatRadioButton, EventLinkComponent, OrderByComparablePipe]
})
export class MovieCtxtMenu {
  private store = inject(Store);
  dialogRef = inject<MatDialogRef<MovieCtxtMenu>>(MatDialogRef);


  public _anchor: ContextMenuRecipient

  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  MovieRatings = MovieRatings

  /**
   * Model
   */
  movie: Movie
  $sessions: Signal<PlannedMovieSession[]>

  constructor() {
    const model = inject<MovieCtxtMenuModel>(MAT_DIALOG_DATA);

    this.movie = model.movie
    this._anchor = model.anchor

    const sessionStoreSignal = this.store.selectSignal(selectPlannedMovieSessions)
    this.$sessions = computed(() => {
      const sessions = sessionStoreSignal()
      return sessions.filter(s => s.movie.id == this.movie.id)
    })
  }

  updateMovieRating($event: MatRadioChange): void {
    this.movie.rating = $event.value
  }


}


export interface MovieCtxtMenuModel{
  anchor: ContextMenuRecipient
  movie : Movie
}