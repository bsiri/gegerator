import { Component, Input, OnInit } from '@angular/core';
import { SESSION_DAY_BOUNDARIES } from 'src/app/models/referential.data';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent implements OnInit {

  @Input() session!: PlannedMovieSession
  
  heightInPixel: string = '0px'

  constructor() {
   }

  ngOnInit(): void {
    // must wait for 'session' to be set before computing dimensions
    this.heightInPixel = ''+SESSION_DAY_BOUNDARIES.lenInPixel(this.session.movie.duration)+'px' 
  }

  updateSession(){
    //placeholder
  }

  confirmThenDelete(){
    //placeholder
  }

}
