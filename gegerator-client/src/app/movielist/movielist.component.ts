import { Component, OnInit } from '@angular/core';
import { parse } from 'iso8601-duration';
import { Observable, of } from 'rxjs';
import { Movie } from '../models/movie';
import { MovielistService } from '../services/movielist.service';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  title = "Films"
  
  // movies: Movie[] = [
  //   {id: 1, title: "Decapitron", duration: parse("PT1H26M")},
  //   {id: 2, title: "The Warriors", duration: parse("PT1H32M")}
  // ]

  movies$: Observable<Movie[]> = of([])


  constructor(private service: MovielistService) {
  }

  ngOnInit(): void {
    this.movies$ = this.service.reloadMovies();
  }

}
