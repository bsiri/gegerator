import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ContextMenuRecipient } from 'src/app/directives/context-menu.directive';
import { EventRating, EventRatings } from 'src/app/models/plannable.model';

/**
 * Menu that allow to select ratings for sessions and activities.
 * 
 * Because it only closes by 'onBlur', the result should be 
 * read straight from the MatDialogRef.componentInstance
 */
@Component({
  selector: 'app-event-rating-menu',
  templateUrl: './event-rating-menu.component.html',
  styleUrls: ['./event-rating-menu.component.scss']
})
export class EventRatingMenu implements OnInit {

  public _anchor: ContextMenuRecipient


  /**
   * "Importing" some pseudo enums so that we can 
   * enumerate them in the view
   */
  EventRatings = EventRatings

  /**
   * Model
   */
  eventRating: EventRating

  constructor(
    public dialogRef: MatDialogRef<EventRatingMenu>,
    @Inject(MAT_DIALOG_DATA) model: SessionRatingMenuModel) {
      this.eventRating = model.eventRating
      this._anchor = model.anchor
    }

  ngOnInit(): void {
  }


  updateRating($event: MatRadioChange): void{
    this.eventRating = $event.value
  }

}

export interface SessionRatingMenuModel{
  anchor: ContextMenuRecipient
  eventRating: EventRating
}