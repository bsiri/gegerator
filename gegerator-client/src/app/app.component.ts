import { ChangeDetectionStrategy, Component, OnInit, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { UploadDialog } from './components/appstate/uploaddialog/uploaddialog.component';
import { Mode } from './ngrx/appstate-models/mode.model';
import { PlannableEvent } from './models/plannable.model';
import { FestivalRoadmap } from './models/roadmap.model';
import { AppStateActions } from './ngrx/actions/appstate.actions';
import { selectActiveRoadmap } from './ngrx/selectors/roadmap.selectors';
import { ModeService } from './services/mode.service';
import { ConfigDialog } from './components/configuration/configdialog/configdialog.component';
import { WizardConfiguration } from './ngrx/appstate-models/wizardconfiguration.model';
import { selectConfiguration } from './ngrx/selectors/configuration.selectors';
import { ConfigurationActions } from './ngrx/actions/configuration.actions';
import { WizardService } from './services/wizard.service';
import { ModeActions } from './ngrx/actions/mode.actions';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MovielistComponent } from './components/movies/movielist/movielist.component';
import { SessionSectionComponent } from './components/sessions/session-section/session-section.component';
import { SummarypanelComponent } from './components/summary/summarypanel/summarypanel.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatLabel, MatIcon, MatSidenavContainer, MatSidenav, MovielistComponent, MatSidenavContent, SessionSectionComponent, SummarypanelComponent]
})
export class AppComponent implements OnInit{

  // exposing the enum Mode as an attribute 
  // so that I can access them from the template
  Mode = Mode

  // Signals
  $wizardmode: Signal<Mode>
  $wizconf: Signal<WizardConfiguration>
  $roadmap: Signal<FestivalRoadmap>

  constructor(private store: Store,
    private dialog: MatDialog,
    private modeService: ModeService,
    // HACK : injecting the WizardService just to have them bootstrapped.
    // There surely is a better way to do this but for now I can live with it.
    private wizardService: WizardService
    ){
      this.$wizardmode = modeService.$mode
      this.$roadmap = this.store.selectSignal(selectActiveRoadmap)
      this.$wizconf = this.store.selectSignal(selectConfiguration)
    }

  ngOnInit(): void {
    this.store.dispatch(AppStateActions.reload_appstate())
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
    const planningMap = this.$roadmap().dailyPlanning()
    let planningStr = "=== Roadmap Gérardmer ===\n\n"

    for (let entry of planningMap.entries()) {
      const [day, events] = entry
      planningStr += `${day.name} :\n` + events.map(this.formatEventStr).join('\n')
      planningStr += '\n\n'
    }

    // Simulate a download, thanks SO question 2897619
    // with a bit of html dirty tricks
    const fakelink = document.createElement('a')
    fakelink.download = 'roadmap.txt'
    fakelink.href = "data:application/octet-stream," + encodeURIComponent(planningStr)
    fakelink.click()

  }

  openWizardConfiguration(): void{
    const dialogRef = this.dialog.open(ConfigDialog, {
      autoFocus: 'first-tabbable',
      data: this.$wizconf().copy()
    })

    dialogRef.afterClosed().subscribe(newconf =>{
      if (!!newconf){
        this.store.dispatch(ConfigurationActions.update_wizconf({wizconf: newconf}))
      }
    })
  }

  // quick and dirty way to remove the day from the 'toString()' output,
  // but that's fragile and would never pass CR if there were one. But hey,
  // that's my pet project so who cares :-)
  formatEventStr(event: PlannableEvent): string{
    return event.toString().replace(/^(.*?), /, '    ')
  }

  toggleMode(): void{
    /*
    FIXME : at the moment there is two distinct states for the wizard Mode:
    - ModeService, at the moment effectively used only in this Component
    - NgRx actions/reducers/selectors.
    Until I unify the systems, I have to update the mode in both in this method.
    TODO: think of how to refactor this and have one system.
    */
    this.store.dispatch(ModeActions.toggle_mode())
    this.modeService.toggleMode()
  }

}
