import { TestBed } from '@angular/core/testing';

import { ConstellationDetailService } from './constellation-detail.service';

describe('ConstellationDetailService', () => {
  let service: ConstellationDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstellationDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
