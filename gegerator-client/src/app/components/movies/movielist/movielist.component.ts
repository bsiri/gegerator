import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, combineLatestWith, debounceTime, map, mergeMap, Observable, withLatestFrom } from 'rxjs';

import { MovieActions } from '../../../ngrx/actions/movie.actions';
import { selectMovieslist } from '../../../ngrx/selectors/movie.selectors';
import { MovieDialog } from '../moviedialog/moviedialog.component';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

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
                  m.title.includes(filterString
                ));

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
        this.store.dispatch(MovieActions.create_movie({movie: newmovie}));
      }
    });
  }

  ngOnInit(): void {  
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
