import { Component } from '@angular/core';
import { TestClientService } from './services/test-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  constructor(private client: TestClientService) {
    console.log('AppComponent::constructor');
    console.log(client.find);
    client.find(1);
  }
}
