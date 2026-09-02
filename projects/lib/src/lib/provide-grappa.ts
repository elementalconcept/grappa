import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { RestClientService } from './internal/rest-client/rest-client.service';

import { instances } from './internal/instances/instances';

export function provideGrappa(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        instances.restClientInstance = inject(RestClientService);
      }
    }
  ]);
}
