import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GrappaModule } from '../../projects/lib/src/lib/grappa.module';

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
