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
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatRadioModule} from '@angular/material/radio';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatSliderModule} from '@angular/material/slider';

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
import { PlannedMovieSessionComponent } from './components/sessions/planned-movie-session/planned-movie-session.component';
import { sessionReducer } from './ngrx/reducers/session.reducer';
import { MovieSessionEffects } from './ngrx/effects/session.effects';
import { TimePipe } from './pipes/time.pipe';
import { SessionDialog } from './components/sessions/sessiondialog/sessiondialog.component';
import { OtherActivityComponent } from './components/sessions/other-activity/other-activity.component';
import { OtherActivityEffects } from './ngrx/effects/activity.effects';
import { activityReducer } from './ngrx/reducers/activity.reducers';
import { SwimlaneItemComponent } from './components/sessions/swimlane-item/swimlane-item.component';
import { Activitydialog } from './components/sessions/activitydialog/activitydialog.component';
import { UploadDialog } from './components/appstate/uploaddialog/uploaddialog.component';
import { AppStateEffects } from './ngrx/effects/appstate.effects';
import { EventRatingMenu } from './components/sessions/event-rating-menu/event-rating-menu.component';
import { SummarypanelComponent } from './components/summary/summarypanel/summarypanel.component';
import { OrderByLowercasePipe } from './pipes/order-by-lowercase.pipe';
import { OrderByComparablePipe } from './pipes/order-by-comparable.pipe';
import { MovieRatingsComponent } from './components/small-comps/movie-ratings/movie-ratings.component';
import { SessionRatingsComponent } from './components/small-comps/session-ratings/session-ratings.component';
import { ContextMenuDirective } from './directives/context-menu.directive';
import { MovieCtxtMenu } from './components/movies/movie-ctxt-menu/movie-ctxt-menu.component';
import { EventLinkComponent } from './components/small-comps/event-link/event-link.component';
import { configurationReducer } from './ngrx/reducers/configuration.reducer';
import { ConfigurationEffects } from './ngrx/effects/configuration.effects';
import { ConfigDialog } from './components/configuration/configdialog/configdialog.component';
import { wizardroadmapReducer } from './ngrx/reducers/wizard-roadmap.reducer';
import { modeReducer } from './ngrx/reducers/mode.reducers';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        StoreModule.forRoot({
            movies: movieReducer,
            sessions: sessionReducer,
            activities: activityReducer,
            configuration: configurationReducer,
            wizardroadmap: wizardroadmapReducer,
            mode: modeReducer
        }, {}),
        EffectsModule.forRoot([MovieEffects, MovieSessionEffects, OtherActivityEffects, AppStateEffects, ConfigurationEffects]),
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSidenavModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatRadioModule,
        MatTabsModule,
        MatMenuModule,
        MatSliderModule,
        MovielistComponent,
        MovieComponent,
        DurationPipe,
        MovieDialog,
        GenericPurposeDialog,
        SessionSectionComponent,
        PlannedMovieSessionComponent,
        TimePipe,
        SessionDialog,
        OtherActivityComponent,
        SwimlaneItemComponent,
        Activitydialog,
        UploadDialog,
        EventRatingMenu,
        SummarypanelComponent,
        OrderByLowercasePipe,
        OrderByComparablePipe,
        MovieRatingsComponent,
        SessionRatingsComponent,
        ContextMenuDirective,
        MovieCtxtMenu,
        EventLinkComponent,
        ConfigDialog
    ],
    providers: [
        httpInterceptorProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
