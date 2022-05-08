import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRatingMenu } from './event-rating-menu.component';

describe('EventRatingMenu', () => {
  let component: EventRatingMenu;
  let fixture: ComponentFixture<EventRatingMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventRatingMenu ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRatingMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
