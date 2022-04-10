import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherSwimlaneComponent } from './other-swimlane.component';

describe('OtherSwimlaneComponent', () => {
  let component: OtherSwimlaneComponent;
  let fixture: ComponentFixture<OtherSwimlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherSwimlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherSwimlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
