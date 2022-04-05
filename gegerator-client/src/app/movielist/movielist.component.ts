import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MovieListActions } from '../actions/movielist.actions';
import { selectMovistlist } from '../selectors/movielist.selectors';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  title = "Films"

  movies$ = this.store.select(selectMovistlist);

  constructor(private store: Store ) {
  }

  ngOnInit(): void {
    this.store.dispatch(MovieListActions.reload_movies());
  }

}
