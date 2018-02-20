import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GrappaModule } from './grappa/grappa.module';

import { AppComponent } from './app.component';
import { TestClientService } from './services/test-client.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    GrappaModule
  ],
  providers: [ TestClientService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
