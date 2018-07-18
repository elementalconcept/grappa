import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AfterRequest, BeforeRequest, GET, POST, PUT, RestClient } from '../grappa/decorators';
import { ObserveOptions } from '../grappa/decorators/options';

import { RestRequest } from '../grappa/services/rest-client/rest-client.service';

@Injectable()
@RestClient('http://localhost:4200/assets')
export class TestClientService {
  @GET('/users.json')
  list: () => Observable<any>;

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
  afterFilter(response: Observable<HttpResponse<Object>>) {
    return response.pipe(map(r => r.body));
  }
}
