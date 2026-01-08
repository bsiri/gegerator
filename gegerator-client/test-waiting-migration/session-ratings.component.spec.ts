import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionRatingsComponent } from './session-ratings.component';

describe('SessionRatingsComponent', () => {
  let component: SessionRatingsComponent;
  let fixture: ComponentFixture<SessionRatingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SessionRatingsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
