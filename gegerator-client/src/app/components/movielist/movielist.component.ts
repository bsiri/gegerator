import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, map, mergeMap, Observable, withLatestFrom } from 'rxjs';
import { Movie } from 'src/app/models/movie';

import { MovieActions } from '../../ngrx/actions/movie.actions';
import { selectMovistlist } from '../../ngrx/selectors/movie.selectors';
import { MovieDialog } from '../moviedialog/moviedialog.component';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  // the movie filter in the template 
  // will be fed into this subject. 
  filtersubject: BehaviorSubject<string> = new BehaviorSubject('')

  movies$ = this.store.select(selectMovistlist).pipe(
    // combine the movie list with the debounced filter subject
    // combineLatestWith(this.filtersubject.pipe(
    //   debounceTime(250)
    // )),
    combineLatestWith(this.filtersubject),
    map(([allMovies, filterString]) => allMovies.filter(m => m.title.includes(filterString)))
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
        this.store.dispatch(MovieActions.create_movie({movie: newmovie}));
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MovieActions.reload_movies());    
  }

  filterMovies(evt: any): void {
    const value = evt.target.value;
    this.filtersubject.next(value);
  }

}
