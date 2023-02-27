import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GrappaModule } from '@elemental-concept/grappa';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GrappaModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
