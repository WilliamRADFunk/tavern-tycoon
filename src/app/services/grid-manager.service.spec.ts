import { TestBed } from '@angular/core/testing';

import { GridManagerService } from './grid-manager.service';

describe('GridManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GridManagerService = TestBed.get(GridManagerService);
    expect(service).toBeTruthy();
  });
});
