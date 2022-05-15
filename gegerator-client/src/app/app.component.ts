import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { UploadDialog } from './components/appstate/uploaddialog/uploaddialog.component';
import { OtherActivity } from './models/activity.model';
import { PlannableEvent } from './models/plannable.model';
import { FestivalRoadmap } from './models/roadmap.model';
import { PlannedMovieSession } from './models/session.model';
import { AppStateActions } from './ngrx/actions/appstate.actions';
import { selectUserRoadmap } from './ngrx/selectors/roadmap.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  roadmap!: FestivalRoadmap

  constructor(private store: Store, 
    private dialog: MatDialog
    ){}

  ngOnInit(): void {
    this.store.dispatch(AppStateActions.reload_appstate())
    this.store.select(selectUserRoadmap).subscribe(rm => this.roadmap = rm)
    // Note : no need to take care of unsubscribing here since destroying the app
    // would essentially entail the completion of all the observables
  }

  uploadAppState(): void{
    const dialogRef = this.dialog.open(UploadDialog, {
      width: '350px',
      autoFocus: "first-tabbable"
    });

    dialogRef.afterClosed().subscribe(file => {
      if (!!file){
        this.store.dispatch(AppStateActions.upload_appstate({file}));
      }
    });
  }

  exportRoadmap(){
    // Build the textual representation of the Roadmap
    const planningMap = this.roadmap.dailyPlanning()
    let planningStr = "=== Roadmap Gérardmer ===\n\n"

    for (let entry of planningMap.entries()) {
      const [day, events] = entry
      planningStr += `${day.name} :\n` + events.map(this.formatEventStr)
      planningStr += '\n'
    }

    // Simulate a download, thanks SO question 2897619
    // with a bit of html dirty tricks
    const fakelink = document.createElement('a')
    fakelink.download = 'roadmap.txt'
    fakelink.href = "data:application/octet-stream," + encodeURIComponent(planningStr)
    fakelink.click()

  }

  // quick and dirty way to remove the day from the 'toString()' output,
  // but that's fragile and would never pass CR if there were one. But hey, 
  // that's my pet project so who cares :-)
  formatEventStr(event: PlannableEvent): string{
    return event.toString().replace(/^(.*?), /, '    ') + '\n'
  }

}
