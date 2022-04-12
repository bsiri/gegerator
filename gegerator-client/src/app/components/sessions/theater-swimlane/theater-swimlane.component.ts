import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Day, Theater } from 'src/app/models/referential.data';

@Component({
  selector: 'app-theater-swimlane',
  templateUrl: './theater-swimlane.component.html',
  styleUrls: [
    '../session-section/swimlanes.general.scss', 
  './theater-swimlane.component.scss'
  ]
})
export class TheaterSwimlaneComponent implements OnInit {


  // thanks StackOverflow again:
  // https://stackoverflow.com/questions/34641281/how-to-add-class-to-host-element
  @HostBinding('class.swimlane') put_this_class= true;

  @Input() day!: Day 
  @Input() theater!: Theater

  constructor() { }

  ngOnInit(): void {
  }

}
