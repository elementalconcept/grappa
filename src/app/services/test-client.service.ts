import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AfterRequest, BeforeRequest, GET, ObserveOptions, POST, PUT, RestClient, RestRequest } from '@elemental-concept/grappa';

@Injectable({
  providedIn: 'root'
})
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

  @PUT('/user/{0}/toggle', { emptyBody: true })
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
