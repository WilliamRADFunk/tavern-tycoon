import { TestBed } from '@angular/core/testing';

import { PathFinderService } from './path-finder.service';

describe('PathFinderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PathFinderService = TestBed.get(PathFinderService);
    expect(service).toBeTruthy();
  });
});
