import { MovieSession, MovieSessionJSON } from "src/app/models/session.model";
import { Movie, MovieJSON } from "src/app/models/movie.model";
import { OtherActivity, OtherActivityJSON } from "src/app/models/activity.model";
import { WizardConfiguration, WizardConfigurationJSON } from "src/app/models/wizardconfiguration.model";

/**
 * AppState is not really a domain object, 
 * that's why it's classified as an ngrx-thing instead.
 */
export class AppState{
    constructor(
        public wizardConfiguration: WizardConfiguration,
        public movies: ReadonlyArray<Movie>,
        public sessions: ReadonlyArray<MovieSession>,
        public activities: ReadonlyArray<OtherActivity>
    ){}

    toJSON(): AppStateJSON{
        return {
            wizardConfiguration: this.wizardConfiguration.toJSON(),
            movies: this.movies.map(m=>m.toJSON()),
            sessions: this.sessions.map(s=>s.toJSON()),
            activities: this.activities.map(a=>a.toJSON())
        }
    }

    static fromJSON(json: AppStateJSON): AppState{
        return new AppState(
            WizardConfiguration.fromJSON(json.wizardConfiguration),
            json.movies.map(Movie.fromJSON),
            json.sessions.map(MovieSession.fromJson),
            json.activities.map(OtherActivity.fromJSON)
        )
    }
}

export interface AppStateJSON{
    wizardConfiguration: WizardConfigurationJSON,
    movies: MovieJSON[],
    sessions: MovieSessionJSON[],
    activities: OtherActivityJSON[]
}


