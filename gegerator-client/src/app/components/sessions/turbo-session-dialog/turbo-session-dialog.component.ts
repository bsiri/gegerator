import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, Signal, effect, inject, signal } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormField, MatError, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Movie } from 'src/app/models/movie.model';
import { Day, Days, Theater, Theaters } from 'src/app/models/referential.data';
import { PlannedMovieSession } from 'src/app/models/session.model';
import { Time } from 'src/app/models/time.model';
import { Times } from 'src/app/models/time.utils';
import { EventRatings } from 'src/app/models/plannable.model';
import { selectMovies } from 'src/app/ngrx/selectors/movie.selectors';
import { PLANNABLE_EVENT_TIME_INTERVAL } from '../session-day-boundaries.model';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-turbo-session-dialog',
  templateUrl: './turbo-session-dialog.component.html',
  styleUrls: ['./turbo-session-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatHint,
    MatError,
    MatButton
  ]
})
export class TurboSessionDialog {
  dialogRef = inject<MatDialogRef<TurboSessionDialog>>(MatDialogRef);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  $availableMovies: Signal<readonly Movie[]> = this.store.selectSignal(selectMovies);
  inputControl = new UntypedFormControl('', [Validators.required]);
  created = new Subject<PlannedMovieSession>();

  private inputValue = signal('');
  private state = signal<TurboParseState>(this.emptyState(''));

  constructor() {
    this.inputControl.valueChanges
      .pipe(startWith(this.inputControl.value ?? ''), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.inputValue.set(String(value ?? '')));

    effect(() => {
      const raw = this.inputValue();
      const movies = this.$availableMovies();
      this.state.set(this.parseInput(raw, movies));
    });

    this.destroyRef.onDestroy(() => this.created.complete());
  }

  // ********** dialog effectors ********************* //

  confirm(): void {
    if (!this.canSubmit) {
      return;
    }

    const parsed = this.state();
    const session = new PlannedMovieSession(
      undefined as unknown as number,
      parsed.movie.match!,
      parsed.theater.match!,
      parsed.day.match!,
      parsed.time.match!,
      EventRatings.DEFAULT
    );

    this.created.next(session);
    this.inputControl.reset('');
    console.log('submitted')
    console.log(arguments)
  }

  close(): void {
    this.dialogRef.close();
  }

  // ************** lifecycle ************* //

  get hasInput(): boolean {
    return this.state().tokens.length > 0;
  }

  get canSubmit(): boolean {
    const parsed = this.state();
    return !!(
      parsed.tokens.length > 0 &&
      parsed.movie.match &&
      parsed.theater.match &&
      parsed.day.match &&
      parsed.time.match
    );
  }

  // *************** Labelling ******************* //

  get movieLabel(): string {
    return this.formatMatch(this.state().movie, movie => movie.title);
  }

  get theaterLabel(): string {
    return this.formatMatch(this.state().theater, theater => theater.name);
  }

  get dayLabel(): string {
    return this.formatMatch(this.state().day, day => day.name);
  }

  get timeLabel(): string {
    return this.formatMatch(this.state().time, time => Times.toString(time));
  }

  get movieStatus(): MatchStatus {
    return this.statusOf(this.state().movie);
  }

  get theaterStatus(): MatchStatus {
    return this.statusOf(this.state().theater);
  }

  get dayStatus(): MatchStatus {
    return this.statusOf(this.state().day);
  }

  get timeStatus(): MatchStatus {
    return this.statusOf(this.state().time);
  }

  // ******************* parser logic ********************* //

  private parseInput(raw: string, movies: readonly Movie[]): TurboParseState {
    const tokens = this.tokenize(raw);

    if (tokens.length === 0) {
      return this.emptyState(raw);
    }

    const tokenCandidates = tokens.map(token => this.buildTokenCandidates(token, movies));
    const best = this.pickBestAssignment(tokenCandidates);

    return {
      raw,
      tokens,
      movie: this.toMatch(best.movie),
      theater: this.toMatch(best.theater),
      day: this.toMatch(best.day),
      time: this.toMatch(best.time)
    };
  }

  private tokenize(raw: string): string[] {
    return raw
      .split(/[\s,]+/)
      .map(token => token.trim())
      .filter(token => token.length > 0);
  }

  private buildTokenCandidates(token: string, movies: readonly Movie[]): TokenCandidates {
    // note: for movies with spaces in their title, it sometimes becomes impossible to desambiguate
    // so here we match on titles without spaces. For example, "redst" can now match "Red Storm"
    return {
      token,
      movie: this.matchToken(token, movies, movie => movie.title.replaceAll(' ', ''), movie => String(movie.id)),
      theater: this.matchToken(token, Theaters.enumerate(), theater => `${theater.name} ${theater.key}`, theater => theater.key),
      day: this.matchToken(token, Days.enumerate(), day => day.name, day => day.key),
      time: this.matchTimeToken(token)
    };
  }

  private matchToken<T>(
    token: string,
    candidates: readonly T[],
    labeler: (candidate: T) => string,
    keyer: (candidate: T) => string
  ): T[] {
    if (!token) {
      return [];
    }

    const matched = new Map<string, T>();
    const lowerToken = token.toLowerCase();
    candidates.forEach(candidate => {
      const label = labeler(candidate).toLowerCase();
      if (label.includes(lowerToken)) {
        matched.set(keyer(candidate), candidate);
      }
    });

    return Array.from(matched.values());
  }

  private matchTimeToken(token: string): Time[] {
    const time = this.parseTimeToken(token);
    if (!time) {
      return [];
    }
    if (!PLANNABLE_EVENT_TIME_INTERVAL.isInRange(time)) {
      return [];
    }
    return [time];
  }

  private pickBestAssignment(tokens: TokenCandidates[]): CandidateMaps {
    const empty = this.emptyCandidateMaps();
    let bestState = this.cloneCandidateMaps(empty);
    let bestScore: CandidateScore | null = null;

    const visit = (index: number, state: CandidateMaps) => {
      if (index >= tokens.length) {
        const score = this.scoreState(state);
        if (!bestScore || this.isBetterScore(score, bestScore)) {
          bestScore = score;
          bestState = this.cloneCandidateMaps(state);
        }
        return;
      }

      const token = tokens[index];
      const options = this.tokenAssignmentOptions(token);
      options.forEach(option => {
        const nextState = this.cloneCandidateMaps(state);
        if (option) {
          this.addCandidates(nextState, option, token[option]);
        }
        visit(index + 1, nextState);
      });
    };

    visit(0, empty);
    return bestState;
  }


  private tokenAssignmentOptions(tokenCandidates: TokenCandidates): Array<FieldName | null> {
    const uniqueFields = this.fieldNames().filter(field => tokenCandidates[field].length === 1);
    const candidateFields = uniqueFields.length > 0
      ? uniqueFields
      : this.fieldNames().filter(field => tokenCandidates[field].length > 0);

    if (candidateFields.length === 0) {
      return [null];
    }

    return [...candidateFields, null];
  }

  private addCandidates(state: CandidateMaps, field: FieldName, candidates: unknown[]): void {
    switch (field) {
      case 'movie':
        this.addToMap(state.movie, candidates as Movie[], movie => String(movie.id));
        break;
      case 'theater':
        this.addToMap(state.theater, candidates as Theater[], theater => theater.key);
        break;
      case 'day':
        this.addToMap(state.day, candidates as Day[], day => day.key);
        break;
      case 'time':
        this.addToMap(state.time, candidates as Time[], time => Times.toString(time));
        break;
    }
  }

  private addToMap<T>(map: Map<string, T>, candidates: T[], keyer: (item: T) => string): void {
    candidates.forEach(candidate => map.set(keyer(candidate), candidate));
  }

  private scoreState(state: CandidateMaps): CandidateScore {
    const sizes = this.fieldNames().map(field => state[field].size);
    const ok = sizes.filter(size => size === 1).length;
    const ambiguous = sizes.filter(size => size > 1).length;
    const missing = sizes.filter(size => size === 0).length;
    const total = sizes.reduce((sum, size) => sum + size, 0);
    return { ok, ambiguous, missing, total };
  }

  private isBetterScore(candidate: CandidateScore, current: CandidateScore): boolean {
    if (candidate.ok !== current.ok) {
      return candidate.ok > current.ok;
    }
    if (candidate.ambiguous !== current.ambiguous) {
      return candidate.ambiguous < current.ambiguous;
    }
    if (candidate.missing !== current.missing) {
      return candidate.missing < current.missing;
    }
    return candidate.total < current.total;
  }

  private toMatch<T>(map: Map<string, T>): TurboMatch<T> {
    const candidates = Array.from(map.values());
    return {
      candidates,
      match: candidates.length === 1 ? candidates[0] : undefined
    };
  }

  private emptyCandidateMaps(): CandidateMaps {
    return {
      movie: new Map(),
      theater: new Map(),
      day: new Map(),
      time: new Map()
    };
  }

  private cloneCandidateMaps(state: CandidateMaps): CandidateMaps {
    return {
      movie: new Map(state.movie),
      theater: new Map(state.theater),
      day: new Map(state.day),
      time: new Map(state.time)
    };
  }

  private fieldNames(): FieldName[] {
    return ['movie', 'theater', 'day', 'time'];
  }

  private parseTimeToken(token: string): Time | null {
    // Supports shorthand: 11 -> 11h00, 1234 -> 12h34, 935 -> 09h35.
    const strtime = token.trim().toLowerCase();
    if (!strtime) {
      return null;
    }

    let hours: number | null = null;
    let minutes: number | null = null;

    /*
      Case: use the 'h' notation.
      In this case we expect 1-2 digits for the hour and 2 digits for minutes.
    */
    if (strtime.includes('h')) {
      const parts = strtime.split('h');
      if (parts.length !== 2) {
        return null;
      }
      const [hStr, mStr] = parts;
      if (!/^\d{1,2}$/.test(hStr) || !/^\d{2}$/.test(mStr)) {
        return null;
      }
      hours = Number(hStr);
      minutes = Number(mStr);
    } 

    /*
      Case: 
    */
    else if (/^\d{1,4}$/.test(strtime)) {
      if (strtime.length <= 2) {
        hours = Number(strtime);
        minutes = 0;
      } else {
        const mStr = strtime.slice(-2);
        const hStr = strtime.slice(0, -2);
        hours = Number(hStr);
        minutes = Number(mStr);
      }
    }
    /*
      Case: no match
    */
    else {
      return null;
    }

    // Sanity check
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return new Time(hours, minutes)
  }


  // *************** small logic utils ******************* //

  private emptyState(raw: string): TurboParseState {
    return {
      raw,
      tokens: [],
      movie: { candidates: [] },
      theater: { candidates: [] },
      day: { candidates: [] },
      time: { candidates: [] }
    };
  }

  private twoDigits(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private statusOf(match: TurboMatch<unknown>): MatchStatus {
    if (match.match) {
      return 'ok';
    }
    if (match.candidates.length === 0) {
      return 'missing';
    }
    return 'ambiguous';
  }

  private formatMatch<T>(match: TurboMatch<T>, labeler: (item: T) => string): string {
    if (match.match) {
      return labeler(match.match);
    }
    if (match.candidates.length === 0) {
      return 'Manquant';
    }
    return `Ambigu: ${match.candidates.map(labeler).join(', ')}`;
  }
}

// ******************* Support interfaces ******************* //

interface TurboMatch<T> {
  candidates: T[];
  match?: T;
}

interface TurboParseState {
  raw: string;
  tokens: string[];
  movie: TurboMatch<Movie>;
  theater: TurboMatch<Theater>;
  day: TurboMatch<Day>;
  time: TurboMatch<Time>;
}

type MatchStatus = 'ok' | 'missing' | 'ambiguous';
type FieldName = 'movie' | 'theater' | 'day' | 'time';

interface TokenCandidates {
  token: string;
  movie: Movie[];
  theater: Theater[];
  day: Day[];
  time: Time[];
}

interface CandidateMaps {
  movie: Map<string, Movie>;
  theater: Map<string, Theater>;
  day: Map<string, Day>;
  time: Map<string, Time>;
}

interface CandidateScore {
  ok: number;
  ambiguous: number;
  missing: number;
  total: number;
}