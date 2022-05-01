import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieRatingsComponent } from './movie-ratings.component';

describe('MovieRatingsComponent', () => {
  let component: MovieRatingsComponent;
  let fixture: ComponentFixture<MovieRatingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieRatingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
