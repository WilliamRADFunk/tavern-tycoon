import { TestBed } from '@angular/core/testing';

import { PersonManagerService } from './person-manager.service';

describe('PersonManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PersonManagerService = TestBed.get(PersonManagerService);
    expect(service).toBeTruthy();
  });
});
