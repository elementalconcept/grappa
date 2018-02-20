import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { AfterRequest, BeforeRequest, GET, POST, PUT, RestClient } from '../grappa/decorators';
import { Observable } from 'rxjs/Observable';
import { RestRequest } from '../grappa/services/rest-client/rest-client.service';

@Injectable()
@RestClient('http://localhost:4200/assets')
export class TestClientService {
  @GET('/users')
  list: () => Observable<any>;

  @GET('/users/{0}')
  find: (id: number) => Observable<any>;

  @POST('/users')
  create: (user: any) => Observable<any>;

  @PUT('/users/{0}')
  update: (id: number, user: any) => Observable<any>;

  @BeforeRequest()
  beforeFilter(request: RestRequest) {
    request.headers[ 'X-Dummy' ] = 'Abcde';
  }

  @AfterRequest()
  afterFilter(response: Observable<HttpResponse<Object>>) {
    return response.map(r => r.body);
  }
}
