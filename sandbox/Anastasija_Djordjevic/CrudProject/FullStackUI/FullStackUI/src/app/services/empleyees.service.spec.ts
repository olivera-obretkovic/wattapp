import { TestBed } from '@angular/core/testing';

import { EmpleyeesService } from './empleyees.service';

describe('EmpleyeesService', () => {
  let service: EmpleyeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleyeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
