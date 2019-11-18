import { Observable } from 'rxjs';

import { RestRequest } from './rest-request';
import { ObserveOptions } from './request-options';

export interface HttpRestClient<T> {
  request(request: RestRequest, observe: ObserveOptions): Observable<T>;
}
