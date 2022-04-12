import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Day } from 'src/app/models/referential.data';

@Component({
  selector: 'app-other-swimlane',
  templateUrl: './other-swimlane.component.html',
  styleUrls: [
    '../session-section/swimlanes.general.scss', 
    './other-swimlane.component.scss'
  ]
})
export class OtherSwimlaneComponent implements OnInit {

  // thanks StackOverflow again:
  // https://stackoverflow.com/questions/34641281/how-to-add-class-to-host-element
  @HostBinding('class.swimlane') put_this_class= true;

  @Input() day!: Day 
  
  constructor() { }

  ngOnInit(): void {
  }

}
