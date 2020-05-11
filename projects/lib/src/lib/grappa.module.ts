import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { RestClientService } from './internal/rest-client/rest-client.service';
import { instances } from './internal/instances/instances';

@NgModule({
  declarations: [],
  imports: [ CommonModule, HttpClientModule ],
  exports: []
})
export class GrappaModule {
  constructor(restClient: RestClientService<any>) {
    instances.restClientInstance = restClient;
  }
}
