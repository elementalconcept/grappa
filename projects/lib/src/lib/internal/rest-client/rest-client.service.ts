import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HttpRestClient, ObserveOptions, RestRequest, UrlParser } from '../../public';

@Injectable({ providedIn: 'root' })
export class RestClientService<T> implements HttpRestClient<T> {
  constructor(private readonly http: HttpClient) {
  }

  request = (request: RestRequest, observe: ObserveOptions): Observable<T> => {
    const method = request.method.toUpperCase();
    const baseUrl = this.getBaseUrl(request);
    const body = this.getBody(request, method);

    return this.http
      .request(
        method,
        UrlParser.parse(baseUrl, request.endpoint, request.args),
        {
          body,
          headers: request.headers,
          params: request.params,
          observe,
          responseType: 'json',
          reportProgress: false
        }
      );
  };

  private getBaseUrl = (request: RestRequest): string =>
    typeof request.baseUrl === 'function'
      ? request.baseUrl()
      : request.baseUrl;

  private getBody = (request: RestRequest, method: string): any => {
    if (method === 'PATCH' || method === 'POST' || method === 'PUT') {
      return request.emptyBody
        ? null
        : request.args.length > 0
          ? request.args[ request.args.length - 1 ]
          : undefined;
    }

    return null;
  };
}

