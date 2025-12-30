import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDialog } from './configdialog.component';

describe('ConfigDialog', () => {
  let component: ConfigDialog;
  let fixture: ComponentFixture<ConfigDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ConfigDialog]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
