import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// TODO Refactor imports
import { AfterRequest, BeforeRequest, GET, POST, PUT, RestClient } from '../../../projects/lib/src/lib/public/decorators';
import { ObserveOptions, RestRequest } from '../../../projects/lib/src/lib/public/models';

@Injectable({ providedIn: 'root' })
@RestClient('http://localhost:4200/assets')
export class TestClientService {
  @GET('/users.json')
  list: () => Observable<any>;

  @GET('/users.json', { query: true })
  querySample: (queryParams: any) => Observable<any>;

  @GET('/users/{0}', { observe: ObserveOptions.Response })
  find: (id: number) => Observable<any>;

  @POST('/users')
  create: (user: any) => Observable<any>;

  @PUT('/users/{0}')
  update: (id: number, user: any) => Observable<any>;

  @BeforeRequest('find')
  beforeFilter(request: RestRequest) {
    request.headers[ 'X-Dummy' ] = 'Abcde';
  }

  @AfterRequest()
  afterFilter(response: Observable<any>) {
    return response.pipe(map(r => r));
  }
}
