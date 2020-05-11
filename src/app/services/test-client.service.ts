import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// TODO Refactor imports
import { AfterRequest, BeforeRequest, GET, POST, PUT, RestClient } from '../../../projects/lib/src/lib/public/decorators';
import { ObserveOptions, RestRequest } from '../../../projects/lib/src/lib/public/models';

@Injectable({ providedIn: 'root' })
@RestClient('http://localhost:8081')
export class TestClientService {
  @GET('/user')
  list: () => Observable<any>;

  @GET('/user/query', { query: true })
  querySample: (queryParams: any) => Observable<any>;

  @GET('/user/{0}', { observe: ObserveOptions.Response })
  find: (id: number) => Observable<any>;

  @POST('/user')
  create: (user: any) => Observable<any>;

  @PUT('/user/{0}')
  update: (id: number, user: any) => Observable<any>;

  @PUT('/user/{0}/toggle', { skipBody: true })
  toggleFlag: (id: number) => Observable<any>;

  @BeforeRequest('find')
  beforeFilter(request: RestRequest) {
    request.headers[ 'X-Dummy' ] = 'Abcde';
  }

  @AfterRequest()
  afterFilter(response: Observable<any>) {
    return response.pipe(map(r => r));
  }
}
