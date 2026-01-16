import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlannableEvent } from 'src/app/models/plannable.model';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-event-link',
    templateUrl: './event-link.component.html',
    styleUrls: ['./event-link.component.scss'],
    imports: []
})
export class EventLinkComponent {

  @Input() event!: PlannableEvent

  constructor() { }
  
  showSelected(target: string){
    const elt = document.getElementById(target)
    elt?.scrollIntoView({behavior: 'smooth'})
  }


}
