import { Component, Input, OnInit } from '@angular/core';
import { PlannableEvent } from 'src/app/models/plannable.model';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-event-link',
    templateUrl: './event-link.component.html',
    styleUrls: ['./event-link.component.scss'],
    imports: [NgIf]
})
export class EventLinkComponent implements OnInit {

  @Input() event!: PlannableEvent

  constructor() { }

  ngOnInit(): void {
  }
  
  
  showSelected(target: string){
    const elt = document.getElementById(target)
    elt?.scrollIntoView({behavior: 'smooth'})
  }


}
