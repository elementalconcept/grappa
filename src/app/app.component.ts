import { Component } from '@angular/core';

import { tap } from 'rxjs/operators';

import { TestClientService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  findResponse: any | null = null;
  listResponse: any | null = null;
  querySampleResponse: any | null = null;
  toggleFlagResponse: any | null = null;
  createResponse: any | null = null;
  updateResponse: any | null = null;

  constructor(private client: TestClientService) {
    client
      .find(123)
      .pipe(tap(res => console.log('find', res)))
      .subscribe(response => this.findResponse = response);

    client
      .list()
      .pipe(tap(res => console.log('list', res)))
      .subscribe(response => this.listResponse = response);

    client
      .querySample({ abc: 'xyz', test: true })
      .pipe(tap(res => console.log('querySample', res)))
      .subscribe(response => this.querySampleResponse = response);

    client
      .toggleFlag(123)
      .pipe(tap(res => console.log('toggleFlag', res)))
      .subscribe(response => this.toggleFlagResponse = response);

    client
      .create(123)
      .pipe(tap(res => console.log('create', res)))
      .subscribe(response => this.createResponse = response);

    client
      .update(123, { x: 'a' })
      .pipe(tap(res => console.log('update', res)))
      .subscribe(response => this.updateResponse = response);
  }
}
