import { Injectable } from '@angular/core';

import { AfterRequest, BeforeRequest, GET, POST, PUT, RestClient } from '../grappa/decorators';
import { Observable } from 'rxjs/Observable';

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
  beforeFilter() {
    console.log('beforeFilter', this);
  }

  @AfterRequest()
  afterFilter() {
    console.log('afterFilter', this);
  }
}
