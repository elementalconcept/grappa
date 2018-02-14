import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GET, POST, RestClient } from '../grappa/decorators';
// import { UID } from '../grappa/core/uid';

@Injectable()
@RestClient('http://localhost:4200/assets')
export class TestClientService {
  @GET('/users')
  list: () => any;

  @GET('/users/{0}')
  find: (id: number) => any;

  @POST('/users')
  create: (user: any) => any;

  constructor(public http: HttpClient) {
    /*console.log('TestClientService::constructor!');
    console.log(this);
    console.log(UID(this));*/
  }
}
