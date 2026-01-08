import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDialog } from './sessiondialog.component';

describe('SessionDialog', () => {
  let component: SessionDialog;
  let fixture: ComponentFixture<SessionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SessionDialog]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
