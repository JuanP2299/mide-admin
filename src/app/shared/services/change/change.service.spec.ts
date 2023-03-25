import { TestBed, inject } from '@angular/core/testing';

import { ChangeService } from './change.service';

describe('ChangeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangeService]
    });
  });

  it('should be created', inject([ChangeService], (service: ChangeService) => {
    expect(service).toBeTruthy();
  }));
});
