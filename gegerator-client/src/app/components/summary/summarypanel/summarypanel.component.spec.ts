import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarypanelComponent } from './summarypanel.component';

describe('SummarypanelComponent', () => {
  let component: SummarypanelComponent;
  let fixture: ComponentFixture<SummarypanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummarypanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarypanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
