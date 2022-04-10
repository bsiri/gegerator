import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-session-day',
  templateUrl: './session-day.component.html',
  styleUrls: ['./session-day.component.scss']
})
export class SessionDayComponent implements OnInit {

  @Input() day!: "thursday" | "friday" | "saturday" | "sunday";

  constructor() { }

  ngOnInit(): void {
  
  }

}
