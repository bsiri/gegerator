import { TestBed } from '@angular/core/testing';

import { SessionlistService } from './sessionlist.service';

describe('SessionlistService', () => {
  let service: SessionlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
