import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheaterSwimlaneComponent } from './theater-swimlane.component';

describe('TheaterSwimlaneComponent', () => {
  let component: TheaterSwimlaneComponent;
  let fixture: ComponentFixture<TheaterSwimlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheaterSwimlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TheaterSwimlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
