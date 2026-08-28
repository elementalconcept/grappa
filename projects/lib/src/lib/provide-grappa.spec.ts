import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { provideGrappa } from './provide-grappa';
import { RestClientService } from './internal/rest-client/rest-client.service';
import { instances } from './internal/instances/instances';

describe('provideGrappa', () => {
  it('provides RestClientService and sets instances.restClientInstance', () => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ provideGrappa() ]
    });

    const client = TestBed.inject(RestClientService);

    expect(client).toBeTruthy();
    expect(instances.restClientInstance).toBe(client);
  });
});
