import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

import { RestClientService } from './internal/rest-client/rest-client.service';

import { instances } from './internal/instances/instances';

/**
 * @deprecated Prefer `provideGrappa()` in a standalone (`bootstrapApplication`) setup.
 * Kept for `NgModule`-based apps — not being removed.
 */
@NgModule({
  declarations: [],
  imports: [ CommonModule ],
  providers: [ provideHttpClient() ],
  exports: []
})
export class GrappaModule {
  constructor(restClient: RestClientService<any>) {
    instances.restClientInstance = restClient;
  }
}
