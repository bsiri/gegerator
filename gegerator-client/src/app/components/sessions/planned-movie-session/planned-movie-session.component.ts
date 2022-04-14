import { Component, Input, OnInit } from '@angular/core';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent implements OnInit {

  @Input() session!: PlannedMovieSession
  
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
