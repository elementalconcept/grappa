import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { RestClientService } from './services/rest-client/rest-client.service';

export let RestClientInstance: RestClientService;

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [],
  providers: [ RestClientService ]
})
export class GrappaModule {
  constructor(restClient: RestClientService) {
    RestClientInstance = restClient;
  }
}
