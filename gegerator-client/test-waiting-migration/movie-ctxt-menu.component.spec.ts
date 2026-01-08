import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCtxtMenu } from './movie-ctxt-menu.component';

describe('MovieCtxtMenu', () => {
  let component: MovieCtxtMenu;
  let fixture: ComponentFixture<MovieCtxtMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MovieCtxtMenu]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieCtxtMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
