import { Component, Input, OnInit } from '@angular/core';
import { MovieSession, PlannedMovieSession } from 'src/app/models/session.model';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';

@Component({
  selector: 'app-planned-movie-session',
  templateUrl: './planned-movie-session.component.html',
  styleUrls: ['./planned-movie-session.component.scss']
})
export class PlannedMovieSessionComponent implements OnInit {

  @Input() session!: PlannedMovieSession
  
  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  constructor() {
   }

  ngOnInit(): void {
    // must wait for 'session' to be set before computing dimensions
    this.heightInPixel = ''+SESSION_DAY_BOUNDARIES.lenInPixel(this.session.movie.duration)+'px' 
    this.topPosInPixel = ''+SESSION_DAY_BOUNDARIES.offsetFromDayBeginInPixel(this.session.startTime)+'px' 
  }

  updateSession(){
    //placeholder
  }

  confirmThenDelete(){
    //placeholder
  }

}
