import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { OtherActivity } from 'src/app/models/activity.model';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';

@Component({
  selector: 'app-other-activity',
  templateUrl: './other-activity.component.html',
  styleUrls: ['./other-activity.component.scss']
})
export class OtherActivityComponent implements OnInit {

  @Input() activity!: OtherActivity

  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  constructor(private store: Store, private dialog: MatDialog) {
  }


  ngOnInit(): void {
    const {startTime, endTime} = this.activity
    // must wait for 'activity' to be set before computing dimensions
    this.heightInPixel = ''+SESSION_DAY_BOUNDARIES.timeDifferenceInPixel(startTime, endTime)+'px' 
    this.topPosInPixel = ''+SESSION_DAY_BOUNDARIES.offsetFromDayBeginInPixel(startTime)+'px' 
  }

  updateActivity(){
    // TODO
  }

  confirmThenDelete(){
    // TODO
  }

}
