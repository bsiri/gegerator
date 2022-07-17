import { Component, Input, OnInit } from '@angular/core';
import { MovieRating } from 'src/app/models/movie.model';

@Component({
  selector: 'app-movie-ratings',
  templateUrl: './movie-ratings.component.html',
  styleUrls: ['./movie-ratings.component.scss']
})
export class MovieRatingsComponent implements OnInit {

  @Input() rating!: MovieRating

  constructor() { }

  ngOnInit(): void {
  }

}
