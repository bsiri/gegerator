import { TestBed } from '@angular/core/testing';

import { ActivitylistService } from './activitylist.service';

describe('ActivitylistService', () => {
  let service: ActivitylistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivitylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
