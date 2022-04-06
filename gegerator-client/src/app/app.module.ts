import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MovielistComponent } from './components/movielist/movielist.component';
import { MovieComponent } from './components/movie/movie.component';
import { DurationPipe } from './pipes/duration.pipe';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { movielistReducer } from './ngrx/reducers/movielist.reducer';
import { MovieListEffects } from './ngrx/effects/movielist.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MovielistComponent,
    MovieComponent,
    DurationPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({movielist: movielistReducer}, {}),
    EffectsModule.forRoot([MovieListEffects]),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
