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
    return this.http
      .request(
        request.method,
        UrlParser.parse(request.baseUrl, request.endpoint, request.args),
        {
          body: request.body,
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

// encodeURIComponent()

export interface RestRequest {
  baseUrl: string;
  endpoint: string;
  method: string;
  headers: { [header: string]: string; };
  params?: { [param: string]: string; };
  body?: any;
  args: any[];
}
