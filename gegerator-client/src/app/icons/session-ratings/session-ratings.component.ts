import { Component, Input, OnInit } from '@angular/core';
import { MovieSessionRating } from 'src/app/models/session.model';

@Component({
  selector: 'app-session-ratings',
  templateUrl: './session-ratings.component.html',
  styleUrls: ['./session-ratings.component.scss']
})
export class SessionRatingsComponent implements OnInit {

  @Input() rating! : MovieSessionRating

  constructor() { }

  ngOnInit(): void {
  }

}
