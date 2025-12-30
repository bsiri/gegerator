import { Component, Input, OnInit } from '@angular/core';
import { MovieRating } from 'src/app/models/movie.model';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'app-movie-ratings',
    templateUrl: './movie-ratings.component.html',
    styleUrls: ['./movie-ratings.component.scss'],
    imports: [NgIf, NgClass]
})
export class MovieRatingsComponent implements OnInit {

  @Input() rating!: MovieRating

  constructor() { }

  ngOnInit(): void {
  }

}
