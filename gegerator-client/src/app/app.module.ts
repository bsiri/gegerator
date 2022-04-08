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

import { AppComponent } from './app.component';
import { MovielistComponent } from './components/movielist/movielist.component';
import { MovieComponent } from './components/movie/movie.component';
import { DurationPipe } from './pipes/duration.pipe';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { movieReducer } from './ngrx/reducers/movie.reducer';
import { MovieEffects } from './ngrx/effects/movie.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateUpdateMovieDialog } from './components/newmoviedialog/newmoviedialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MovielistComponent,
    MovieComponent,
    DurationPipe,
    CreateUpdateMovieDialog
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
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
