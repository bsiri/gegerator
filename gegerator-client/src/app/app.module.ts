import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatCardModule} from '@angular/material/card'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatIconModule} from '@angular/material/icon'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import {MatSidenavModule} from '@angular/material/sidenav'; 

import { AppComponent } from './app.component';
import { MovielistComponent } from './components/movies/movielist/movielist.component';
import { MovieComponent } from './components/movies/movie/movie.component';
import { DurationPipe } from './pipes/duration.pipe';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { movieReducer } from './ngrx/reducers/movie.reducer';
import { MovieEffects } from './ngrx/effects/movie.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MovieDialog } from './components/movies/moviedialog/moviedialog.component';
import { GenericPurposeDialog } from './components/genericpurposedialog/genericpurposedialog.component';
import { httpInterceptorProviders } from './interceptors/interceptorprovider';
import { SessionSectionComponent } from './components/sessions/session-section/session-section.component';
import { SessionDayComponent } from './components/sessions/session-day/session-day.component';
import { TheaterSwimlaneComponent } from './components/sessions/theater-swimlane/theater-swimlane.component';
import { OtherSwimlaneComponent } from './components/sessions/other-swimlane/other-swimlane.component';

@NgModule({
  declarations: [
    AppComponent,
    MovielistComponent,
    MovieComponent,
    DurationPipe,
    MovieDialog,
    GenericPurposeDialog,
    SessionSectionComponent,
    SessionDayComponent,
    TheaterSwimlaneComponent,
    OtherSwimlaneComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({movielist: movieReducer}, {}),
    EffectsModule.forRoot([MovieEffects]),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
