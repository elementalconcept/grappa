import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { UrlParser } from '../../core/url-parser/url-parser';

@Injectable()
export class RestClientService {
  constructor(private http: HttpClient) {
  }

  request(request: RestRequest, returnResponse: boolean = false): Observable<Object> {
    const method = request.method.toUpperCase();
    const body = (method === 'POST' || method === 'PUT') && request.args.length > 0 ? request.args[ request.args.length - 1 ] : undefined;

    const result = this.http
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
      );

    return returnResponse ? result : result.map(response => response.body);
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
