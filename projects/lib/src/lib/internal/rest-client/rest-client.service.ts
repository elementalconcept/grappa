import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ObserveOptions, RestRequest } from '../../public';
import { UrlParser } from '../url-parser/url-parser';

@Injectable({ providedIn: 'root' })
export class RestClientService {
  constructor(private http: HttpClient) {
  }

  request(request: RestRequest, observe: ObserveOptions): Observable<any> {
    let body;

    const method = request.method.toUpperCase();

    const baseUrl = typeof request.baseUrl === 'function'
      ? request.baseUrl()
      : request.baseUrl;

    if (method === 'POST' || method === 'PUT') {
      body = request.skipBody
        ? null
        : request.args.length > 0
          ? request.args[ request.args.length - 1 ]
          : undefined;
    }

    return this.http
      .request(
        method,
        UrlParser.parse(baseUrl, request.endpoint, request.args),
        {
          body: body,
          headers: request.headers,
          params: request.params,
          observe: observe,
          responseType: 'json',
          reportProgress: false
        }
      );
  }
}

