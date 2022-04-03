import { Component, OnInit } from '@angular/core';
import { Movie } from '../models/movie';

@Component({
  selector: 'app-movielist',
  templateUrl: './movielist.component.html',
  styleUrls: ['./movielist.component.scss']
})
export class MovielistComponent implements OnInit {

  title = "Films"
  
  movies: Movie[] = [
    {id: 1, title: "Decapitron", duration: "PT1H26M"},
    {id: 2, title: "The Warriors", duration: "PT1h32M"}
  ]

  constructor() {
   }

  ngOnInit(): void {


  }

}
