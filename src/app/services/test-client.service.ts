import { Injectable } from '@angular/core';

import { GET, POST, PUT, RestClient } from '../grappa/decorators';

@Injectable()
@RestClient('http://localhost:4200/assets')
export class TestClientService {
  @GET('/users')
  list: () => any;

  @GET('/users/{0}')
  find: (id: number) => any;

  @POST('/users')
  create: (user: any) => any;

  @PUT('/users/{0}')
  update: (id: number, user: any) => any;
}
