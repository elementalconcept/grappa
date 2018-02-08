import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RestClientService {
  constructor(private http: HttpClient) {
    console.log('RestClientService');
  }
}
