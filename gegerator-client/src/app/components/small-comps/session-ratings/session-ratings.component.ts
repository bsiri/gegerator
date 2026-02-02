import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EventRating } from 'src/app/models/plannable.model';
import { NgClass } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-session-ratings',
    templateUrl: './session-ratings.component.html',
    styleUrls: ['./session-ratings.component.scss'],
    imports: [NgClass]
})
export class SessionRatingsComponent {
  @Input() rating! : EventRating
}
