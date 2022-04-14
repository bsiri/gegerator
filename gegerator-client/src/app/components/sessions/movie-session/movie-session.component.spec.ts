import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSessionComponent } from './movie-session.component';

describe('MovieSessionComponent', () => {
  let component: MovieSessionComponent;
  let fixture: ComponentFixture<MovieSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
