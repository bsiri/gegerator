import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSectionComponent } from './session-section.component';

describe('SessionSectionComponent', () => {
  let component: SessionSectionComponent;
  let fixture: ComponentFixture<SessionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SessionSectionComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
