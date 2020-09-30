import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BackgroundComponent } from './components/background/background.component';
import { GameGridComponent } from './components/game-grid/game-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    BackgroundComponent,
    GameGridComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
