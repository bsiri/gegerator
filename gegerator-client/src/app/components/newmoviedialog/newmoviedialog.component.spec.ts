import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMovieDialog } from './newmoviedialog.component';

describe('NewMovieDialog', () => {
  let component: NewMovieDialog;
  let fixture: ComponentFixture<NewMovieDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewMovieDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMovieDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
