import { Component } from '@angular/core';

import { TestClientService } from './services/test-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  constructor(private client: TestClientService) {
    client.find(123).subscribe(res => console.log('find', res));
    client.list().subscribe(res => console.log('list', res));
    client.querySample({ abc: 'xyz', test: true }).subscribe(res => console.log('querySample', res));
    client.toggleFlag(123).subscribe(res => console.log('toggleFlag', res));
    client.create(123).subscribe(res => console.log('create', res));
    client.update(123, { x: 'a' }).subscribe(res => console.log('update', res));
  }
}
