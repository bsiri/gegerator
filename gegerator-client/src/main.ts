import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { httpInterceptorProviders } from './app/interceptors/interceptorprovider';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { movieReducer } from './app/ngrx/reducers/movie.reducer';
import { sessionReducer } from './app/ngrx/reducers/session.reducer';
import { activityReducer } from './app/ngrx/reducers/activity.reducers';
import { configurationReducer } from './app/ngrx/reducers/configuration.reducer';
import { wizardroadmapReducer } from './app/ngrx/reducers/wizard-roadmap.reducer';
import { modeReducer } from './app/ngrx/reducers/mode.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MovieEffects } from './app/ngrx/effects/movie.effects';
import { MovieSessionEffects } from './app/ngrx/effects/session.effects';
import { OtherActivityEffects } from './app/ngrx/effects/activity.effects';
import { AppStateEffects } from './app/ngrx/effects/appstate.effects';
import { ConfigurationEffects } from './app/ngrx/effects/configuration.effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, HttpClientModule, StoreModule.forRoot({
            movies: movieReducer,
            sessions: sessionReducer,
            activities: activityReducer,
            configuration: configurationReducer,
            wizardroadmap: wizardroadmapReducer,
            mode: modeReducer
        }, {}), EffectsModule.forRoot([MovieEffects, MovieSessionEffects, OtherActivityEffects, AppStateEffects, ConfigurationEffects]), FormsModule, ReactiveFormsModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSidenavModule, MatSelectModule, MatAutocompleteModule, MatRadioModule, MatTabsModule, MatMenuModule, MatSliderModule),
        httpInterceptorProviders,
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
