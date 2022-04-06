import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-newmoviedialog',
  templateUrl: './newmoviedialog.component.html',
  styleUrls: ['./newmoviedialog.component.scss']
})
export class NewMovieDialog implements OnInit {

  constructor(public dialogRef: MatDialogRef<NewMovieDialog>) { }

  ngOnInit(): void {
  }

}
