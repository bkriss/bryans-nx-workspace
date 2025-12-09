import { TestBed } from '@angular/core/testing';

import { RankingsService } from './rankings.service';
import { provideHttpClient } from '@angular/common/http';

describe('RankingsService', () => {
  let service: RankingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(RankingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
