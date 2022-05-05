import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PlannableItem } from 'src/app/models/plannable.model';
import { SESSION_DAY_BOUNDARIES } from '../session-day-boundaries.model';


/**
 * Kind of CSS rendering for the content
 * of that swimlane element. They are listed 
 * here by order of extravaganza.
 */
export enum SwItemContentRendering{
  DISABLED = "content-disabled",
  NORMAL = "content-normal",
  GREEN = "content-green",
  VERY_GREEN = "content-very-green",
  OUTSTANDING = "content-outstanding",
}

/**
 * Kind of CSS rendering for the border
 * of that swimlane element. They are listed 
 * here by order of extravaganza.
 */
export enum SwItemBorderRendering{
  DISABLED = "border-disabled",
  NORMAL = "border-normal",
  SALIENT = "border-salient",
  OUTSTANDING = "border-outstanding"
}




/*
  Abstract class for PlannedMovieSessionComponent and OtherActivityComponent.
  Its main job is to compute its dimensions and position within its swimlane, 
  based on the start time and duration of the Plannable it represents.
*/
@Component({
  selector: 'app-swimlane-item',
  templateUrl: './swimlane-item.component.html',
  styleUrls: ['./swimlane-item.component.scss']
})
export class SwimlaneItemComponent implements OnInit{

  @ViewChild('_container') private _container!: ElementRef

  /**
   * The item to plan, which must be a PlannableItem
   */
  @Input() item!: PlannableItem


  /**
   * How the item needs to style its content.
   */
  @Input() contentRendering : SwItemContentRendering = SwItemContentRendering.NORMAL

  /**
   * How the item needs to style its border.
   */
  @Input() borderRendering : SwItemBorderRendering = SwItemBorderRendering.NORMAL
  

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

  /**
   * Computed properties, used to determine the final
   * rendering (see ngOnInit)
   */
  heightInPixel: string = '0px'
  topPosInPixel: string = '0px'

  extraClasses(): string[]{
    return [this.contentRendering, this.borderRendering]
  }
    
  /**
   * Exposes the final dimensions of that Component,
   * after rendering
   */
   public get dimensions(): DOMRect{
    return this._container.nativeElement.getBoundingClientRect()
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
