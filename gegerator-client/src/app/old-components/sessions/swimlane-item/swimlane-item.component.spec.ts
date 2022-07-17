import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimlaneItemComponent } from './swimlane-item.component';

describe('SwimlaneItemComponent', () => {
  let component: SwimlaneItemComponent;
  let fixture: ComponentFixture<SwimlaneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwimlaneItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimlaneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
