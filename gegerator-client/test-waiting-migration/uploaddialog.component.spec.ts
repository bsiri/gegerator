import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDialog } from './uploaddialog.component';

describe('UploadDialog', () => {
  let component: UploadDialog;
  let fixture: ComponentFixture<UploadDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UploadDialog]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
