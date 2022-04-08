import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieListActions } from '../../ngrx/actions/movielist.actions';
import { selectMovistlist } from '../../ngrx/selectors/movielist.selectors';
import { NewMovieDialog } from '../newmoviedialog/newmoviedialog.component';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  title = "Films"

  movies$ = this.store.select(selectMovistlist);

  constructor(private store: Store, private dialog: MatDialog ) {
  }

  openNewMovie(): void {
    const dialogRef = this.dialog.open(NewMovieDialog, {
      width: '350px',
      autoFocus: "first-tabbable",
      data: { id: null, title: '', duration: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`received movie : id=${result.id}, title=${result.title}, duration=${result.duration}`)
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MovieListActions.reload_movies());
  }

}
