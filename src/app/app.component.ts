import { Component } from '@angular/core';
import { TestClientService } from './services/test-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  constructor(private client: TestClientService) {
    client.update(123, {abc: 'xyz'}).subscribe();
  }
}
