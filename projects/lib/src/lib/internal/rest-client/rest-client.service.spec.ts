import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RestClientService } from './rest-client.service';
import { ObserveOptions } from '../../public/models';

describe('RestClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ RestClientService ]
    });
  });

  it('should make GET request', inject(
    [ RestClientService, HttpTestingController ],
    (service: RestClientService, http: HttpTestingController) => {
      service
        .request(
          {
            baseUrl: 'http://localhost',
            endpoint: 'user/{0}',
            method: 'GET',
            headers: {},
            args: [ 123 ],
            skipBody: false
          },
          ObserveOptions.Body)
        .subscribe(response => expect(response.id).toBe(123));

      const request = http.expectOne('http://localhost/user/123');
      request.flush({ id: 123, name: 'xyz' });

      http.verify();
    }));

  it('should make POST request', inject(
    [ RestClientService, HttpTestingController ],
    (service: RestClientService, http: HttpTestingController) => {
      service
        .request({
            baseUrl: 'http://localhost',
            endpoint: 'user/{0}',
            method: 'POST',
            headers: {},
            args: [ 123, { name: 'xyz' } ],
            skipBody: false
          },
          ObserveOptions.Body)
        .subscribe(response => expect(response.id).toBe(123));

      const request = http.expectOne((req) => req.url === 'http://localhost/user/123' && req.body.name === 'xyz');
      request.flush({ id: 123, name: 'xyz' });

      http.verify();
    }));
});
