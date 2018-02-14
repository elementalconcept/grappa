import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { UrlParser } from '../../core/url-parser';

@Injectable()
export class RestClientService {
  constructor(private http: HttpClient) {
  }

  request(request: RestRequest): Observable<Object> {
    const method = request.method.toUpperCase();
    const body = (method === 'POST' || method === 'PUT') && request.args.length > 0 ? request.args[request.args.length - 1] : undefined;

    return this.http
      .request(
        method,
        UrlParser.parse(request.baseUrl, request.endpoint, request.args),
        {
          body: body,
          headers: request.headers,
          params: request.params,
          observe: 'response',
          responseType: 'json',
          reportProgress: false
        }
      )
      .map(response => response.body);
  }
}

export interface RestRequest {
  baseUrl: string;
  endpoint: string;
  method: string;
  headers: { [header: string]: string; };
  params?: { [param: string]: string; };
  args: any[];
}
