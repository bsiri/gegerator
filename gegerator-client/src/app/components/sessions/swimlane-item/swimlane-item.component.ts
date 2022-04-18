import {  Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlannableItem } from 'src/app/models/plannable.model';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';

/*
  Abstract class for PlannedMovieSessionComponent and OtherActivityComponent.

  This class has an awkward plumbing
*/
@Component({
  selector: 'app-swimlane-item',
  templateUrl: './swimlane-item.component.html',
  styleUrls: ['./swimlane-item.component.scss']
})
export class SwimlaneItemComponent implements OnInit{

  /**
   * The item to plan, which must be a PlannableItem
   */
  @Input() item!: PlannableItem
  
  /**
   * Requests the model objet to be updated. 
   * It is triggered when the component is doubleclicked.
   */
  @Output() requestUpdate = new EventEmitter()
  
  /**
   * Requests the model object to be deleted.
   * It is triggered when the small delete button 
   * has been clicked.
   */
  @Output() requestDelete = new EventEmitter()

  
  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  constructor() { }

  ngOnInit(): void {
    /*
    Must wait for 'item' to be available before computing dimensions.
    Here it is tricky, because the parent views (PlannedMovieSessionComponent or OtherActivityComponent)
    themselves not have this object available when the SwimlaneItemComponent is instanciated.

    So here we just skip and and wait until the parent view can pass an actual intance along.
    It's dirty but simple. For other solutions, see : 
    https://stackoverflow.com/questions/41389124/angular-2-how-to-make-child-component-wait-for-async-data-to-be-ready
    */
    if (! this.item){
      return
    }
    const {startTime, endTime} = this.item
    this.heightInPixel = ''+SESSION_DAY_BOUNDARIES.timeDifferenceInPixel(startTime, endTime)+'px' 
    this.topPosInPixel = ''+SESSION_DAY_BOUNDARIES.offsetFromDayBeginInPixel(startTime)+'px' 
  }

}
