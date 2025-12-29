import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Activitydialog } from './activitydialog.component';

describe('ActivityDialog', () => {
  let component: Activitydialog;
  let fixture: ComponentFixture<Activitydialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Activitydialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Activitydialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
