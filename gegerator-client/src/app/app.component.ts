import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { UploadDialog } from './components/appstate/uploaddialog/uploaddialog.component';
import { MovielistComponent } from './components/movies/movielist/movielist.component';
import { AppStateActions } from './ngrx/actions/appstate.actions';
import { MovieActions } from './ngrx/actions/movie.actions';
import { AppStateService } from './services/appstate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = "Gegerator"

  constructor(private store: Store, 
    private dialog: MatDialog
    ){}

  ngOnInit(): void {
    this.store.dispatch(AppStateActions.reload_appstate())
  }

  uploadAppState(): void{
    const dialogRef = this.dialog.open(UploadDialog, {
      autoFocus: "first-tabbable"
    });

    dialogRef.afterClosed().subscribe(file => {
      if (!!file){
        this.store.dispatch(AppStateActions.upload_appstate({file}));
      }
    });
  }

}
