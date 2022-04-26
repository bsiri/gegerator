import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingDialog } from './ratingdialog.component';

describe('RatingDialog', () => {
  let component: RatingDialog;
  let fixture: ComponentFixture<RatingDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatingDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
