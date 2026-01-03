import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPurposeDialog } from './genericpurposedialog.component';

describe('Confirmdialog', () => {
  let component: GenericPurposeDialog;
  let fixture: ComponentFixture<GenericPurposeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [GenericPurposeDialog]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPurposeDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
