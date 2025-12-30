import { Component, Input, OnInit } from '@angular/core';
import { EventRating } from 'src/app/models/plannable.model';

@Component({
    selector: 'app-session-ratings',
    templateUrl: './session-ratings.component.html',
    styleUrls: ['./session-ratings.component.scss'],
    standalone: false
})
export class SessionRatingsComponent implements OnInit {

  @Input() rating! : EventRating

  constructor() { }

  ngOnInit(): void {
  }

}
