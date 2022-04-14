import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Days, Theaters } from 'src/app/models/referential.data';

@Component({
  selector: 'app-session-section',
  templateUrl: './session-section.component.html',
  styleUrls: ['./session-section.component.scss']
})
export class SessionSectionComponent implements OnInit {


  /*
  Working around inability to import classes in 
  the template itself.
  Note : return
  */

  Days = Days
  Theaters = Theaters

  sessions$ = this.store.select(selectMovistlist)

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
  }



}
