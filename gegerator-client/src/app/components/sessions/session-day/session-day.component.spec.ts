import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDayComponent } from './session-day.component';

describe('SessionDayComponent', () => {
  let component: SessionDayComponent;
  let fixture: ComponentFixture<SessionDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
