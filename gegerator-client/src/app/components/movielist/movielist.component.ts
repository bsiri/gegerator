import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MovieActions } from '../../ngrx/actions/movie.actions';
import { selectMovistlist } from '../../ngrx/selectors/movie.selectors';
import { CreateUpdateMovieDialog } from '../newmoviedialog/newmoviedialog.component';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  movies$ = this.store.select(selectMovistlist);

  constructor(private store: Store, private dialog: MatDialog ) {
  }

  openNewMovie(): void {
    const dialogRef = this.dialog.open(CreateUpdateMovieDialog, {
      width: '350px',
      autoFocus: "first-tabbable",
      data: { id: undefined, title: '', duration: undefined }
    });

    dialogRef.afterClosed().subscribe(newmovie => {
      if (!!newmovie){
        this.store.dispatch(MovieActions.create_movie({movie: newmovie}));
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MovieActions.reload_movies());    
  }

}
