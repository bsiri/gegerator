import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDialog } from './moviedialog.component';

describe('MovieDialog', () => {
  let component: MovieDialog;
  let fixture: ComponentFixture<MovieDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MovieDialog]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
