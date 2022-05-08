import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { OtherActivity } from 'src/app/models/activity.model';
import { EventRating, EventRatings } from 'src/app/models/plannable.model';
import { FestivalRoadmap, RoadmapAuthor } from 'src/app/models/roadmap.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { Activitydialog } from '../activitydialog/activitydialog.component';
import { EventRatingMenu } from '../event-rating-menu/event-rating-menu.component';
import { SwimlaneItemComponent, SwItemBorderRendering, SwItemContentRendering } from '../swimlane-item/swimlane-item.component';

@Component({
  selector: 'app-other-activity',
  templateUrl: './other-activity.component.html',
  styleUrls: ['./other-activity.component.scss']
})
export class OtherActivityComponent implements OnInit {

  @ViewChild(SwimlaneItemComponent) private _swlitem!: SwimlaneItemComponent 

  @Input() activity!: OtherActivity

  @Input() roadmap!: FestivalRoadmap

  constructor(private store: Store, private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  // *********** border styles **************

  get contentRendering(): SwItemContentRendering{
    if (this._isOutstanding()){
      return "outstanding"
    }

    if (this.activity.rating == EventRatings.NEVER){
      return "disabled"
    }

    return "normal"

  }

  get borderRendering(): SwItemBorderRendering{
    if (this._isOutstanding()){
      return "outstanding"
    }

    return sessionRatingClasses.get(this.activity.rating) ?? "normal"

  }

  _isOutstanding(): boolean{
    const roadmap = this.roadmap
    return (roadmap.isInRoadmap(this.activity) && roadmap.author == RoadmapAuthor.MACHINE)
  }

  // *********** data update ******************

  update(){
    const _clone = { ...this.activity} as OtherActivity
    const dialogRef = this.dialog.open(Activitydialog, {
      autoFocus: 'first-tabbable',
      data: _clone
    })

    dialogRef.afterClosed().subscribe(updatedActivityData =>{
      if (! updatedActivityData){
        return 
      }
      const activity = updatedActivityData
      this.store.dispatch(ActivityActions.update_activity({activity}))
    })  }


  // Update the Ratings for the Activity
  updateRating(){
    const dialogRef = this.dialog.open(EventRatingMenu, {
      data: {
        anchor: this._swlitem,
        eventRating: this.activity.rating
      },
      backdropClass: 'rating-nobackdrop'
    })

    // Reading the result straight from the dialog content
    // (remember that this dialog is blur only, so the API doesn't
    // allow to set a result).
    // Then update the event rating if changed.
    dialogRef.afterClosed().subscribe((whatever) =>{
      const newRating = dialogRef.componentInstance.eventRating

      
      if (this.activity.rating != newRating){
        const activity = this.activity.copy({rating: newRating})
        this.store.dispatch(ActivityActions.update_activity({activity}))
      }

    })
  }


  confirmThenDelete(){
    const dialogRef = this.dialog.open(GenericPurposeDialog, {
      data: {
        html: `Vraiment supprimer cette activité ?`,
        type: "confirm"
      }
    });

    dialogRef.afterClosed().subscribe(response =>{
      if (response == ConfirmOutput.CONFIRM){
        const activity = this.activity
        this.store.dispatch(ActivityActions.delete_activity({activity}))  
      }
    })
  }

}

// ************* css mapping ************

const sessionRatingClasses = new Map<EventRating, SwItemBorderRendering>(
  [
    [EventRatings.MANDATORY, "salient"],
    [EventRatings.DEFAULT, "normal"],
    [EventRatings.NEVER, "disabled"]    
  ]
)