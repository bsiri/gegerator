import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieRatingMenu } from './movie-rating-menu.component';

describe('MovieRatingMenu', () => {
  let component: MovieRatingMenu;
  let fixture: ComponentFixture<MovieRatingMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieRatingMenu ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieRatingMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
