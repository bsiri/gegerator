import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedMovieSessionComponent } from './planned-movie-session.component';

describe('PlannedMovieSessionComponent', () => {
  let component: PlannedMovieSessionComponent;
  let fixture: ComponentFixture<PlannedMovieSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannedMovieSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannedMovieSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
