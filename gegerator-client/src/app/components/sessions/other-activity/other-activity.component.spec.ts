import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherActivityComponent } from './other-activity.component';

describe('OtherActivityComponent', () => {
  let component: OtherActivityComponent;
  let fixture: ComponentFixture<OtherActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
