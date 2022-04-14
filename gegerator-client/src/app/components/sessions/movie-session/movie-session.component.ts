import { Component, Input, OnInit } from '@angular/core';
import { MovieSession } from 'src/app/models/session.model';

@Component({
  selector: 'app-movie-session',
  templateUrl: './movie-session.component.html',
  styleUrls: ['./movie-session.component.scss']
})
export class MovieSessionComponent implements OnInit {

  @Input() session!: MovieSession
  /*
  @Input() cssHeightPx!: number;
  @Input() cssTopPx!: number;
  */

  constructor() { }

  ngOnInit(): void {
  }

  updateSession(){
    //placeholder
  }

  confirmThenDelete(){
    //placeholder
  }

}
