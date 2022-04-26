import {  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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

  @ViewChild('swimlaneItemContainer') container!: ElementRef

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

  /**
   * Requests that a context menu of some sort 
   * to be opened. Triggered when 
   * right clicking on the component.
   * 
   * Note : the original right-click event will 
   * also be neutralized.
   */
  @Output() requestContextMenu = new EventEmitter()

  
  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  /**
   * Computed dimensions, because I need to export them
   * for consumption by PlanedMovieSessionComponent.
   * 
   * Note : they are relative to the viewport (they 
   * account for the scrolling).
   */
  get dimensions(): SwimlaneItemDimensions{
    const rect = this.container.nativeElement.getBoundingClientRect()
    return {
      top: rect.top + window.scrollX, 
      left: rect.left + window.screenY, 
      height: rect.height, 
      width: rect.width
    }   
  }


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


  emitRequestContextMenu(){
    this.requestContextMenu.emit()
    // kill the event propagation; 
    // stopPropagation() and stopImmediatePropagation() wont work
    return false
  }

}

/*
  Subset of a DomRect element,
  all units are expressed in pixels
*/
export interface SwimlaneItemDimensions{
  top: number
  left: number,
  width: number,
  height: number
}