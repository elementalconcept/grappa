import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GrappaModule } from './grappa/grappa.module';

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
