import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { OtherActivity } from 'src/app/models/activity.model';
import { ActivityActions } from 'src/app/ngrx/actions/activity.actions';
import { ConfirmOutput, GenericPurposeDialog } from '../../genericpurposedialog/genericpurposedialog.component';
import { Activitydialog } from '../activitydialog/activitydialog.component';

@Component({
  selector: 'app-other-activity',
  templateUrl: './other-activity.component.html',
  styleUrls: ['./other-activity.component.scss']
})
export class OtherActivityComponent implements OnInit {

  @Input() activity!: OtherActivity

  constructor(private store: Store, private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

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
      const activity = this.activity
      this.store.dispatch(ActivityActions.update_activity({activity}))
    })  }


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
