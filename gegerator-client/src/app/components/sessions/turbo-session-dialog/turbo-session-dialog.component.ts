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


const FIELD_NAMES: FieldName[] = ['movie', 'theater', 'day', 'time'];

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
    let label = this.formatMatch(this.state().movie, movie => movie.title);
    // limit the label to only two ambiguous candidates to avoid overflow in the UI
    if (label.startsWith('Ambigu:')) {
      label = label.split(',').slice(0, 2).join(', ');
    }
    return label
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

  /**************************************************************************
   * Parser logic 
   **************************************************************************/

  /**
   * Parses the raw input string into a structured state containing the identified movie, theater, day, and time.
   * 
   * If multiple combinations of matches are possible, the one with the best score is chosen. 
   * The scoring favors states with more fields matched, fewer ambiguous matches, and fewer total candidates.
   * 
   * @param rawInput : the raw input string to parse
   * @param movies : the list of available movies to match against
   * @returns 
   */
  private parseInput(rawInput: string, movies: readonly Movie[]): TurboParseState {
    const tokens = this.tokenize(rawInput);

    if (tokens.length === 0) {
      return this.emptyState(rawInput);
    }

    const candidates = tokens.map(token => this.buildTokenMatchCandidates(token, movies));
    const best = this.pickBestAssignment(candidates);

    return {
      raw: rawInput,
      tokens,
      movie: this.toMatch(best.movie),
      theater: this.toMatch(best.theater),
      day: this.toMatch(best.day),
      time: this.toMatch(best.time)
    };
  }

  /////////////// Tokenization and match logic ////////////////

  private tokenize(raw: string): string[] {
    return raw
      .split(/[\s,]+/)
      .map(token => token.trim())
      .filter(token => token.length > 0);
  }

  /**
   * Builds the candidate matches for a given token across movies, theaters, days, and times.
   * 
   * @param token The input token to match.
   * @param movies The list of available movies to match against.
   * @returns An object containing candidate matches for each category.
   */
  private buildTokenMatchCandidates(token: string, movies: readonly Movie[]): TokenMatchCandidates {
    // note: for movies with spaces in their title, it sometimes becomes impossible to desambiguate
    // so here we match on titles without spaces. For example, "redst" can now match "Red Storm"
    const candidates = {
      token,
      movie: this.matchToken(token, movies, movie => movie.title.replaceAll(' ', ''), movie => String(movie.id)),
      theater: this.matchToken(token, Theaters.enumerate(), theater => `${theater.name} ${theater.key}`, theater => theater.key),
      day: this.matchToken(token, Days.enumerate(), day => day.name, day => day.key),
      time: this.matchTimeToken(token)
    };
    return candidates;
  }

  /**
   * Collect all values from candidates that match the token, and returns them as an array.
   * 
   * The token is tested against the candidates using the provided labeler function. 
   * The keyer function is used to ensure uniqueness of candidates.
   * 
   * @param token : the input token to match
   * @param candidates : the list of candidates to match against
   * @param labeler : a function that produces a string label for a candidate, used for matching against the token
   * @param keyer : a function that produces a unique string key for a candidate, used to ensure uniqueness in the results
   * @returns An array of candidates that match the token.
   */
  private matchToken<T>(
    token: string,
    candidates: readonly T[],
    labeler: (candidate: T) => string,
    keyer: (candidate: T) => string
  ): T[] {
    if (!token) {
      return [];
    }

    const lowerToken = token.toLowerCase();
    const matched = new Map<string, T>();
    candidates.forEach(candidate => {
      const label = labeler(candidate).toLowerCase();
      if (label.includes(lowerToken)) {
        matched.set(keyer(candidate), candidate);
      }
    });

    return Array.from(matched.values());
  }


  /**
   * Parses the token as a time and ensure it is within the plannable event time interval. 
   * Supports various formats and notations as described in parseTimeToken.
   * 
   * @param token : the input token to parse as a time
   * @returns : an array containing the matched Time if parsing is successful and within range, or an empty array otherwise.
   */
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

  /**
   * Parses a time token into a Time object. Supports full format, and shorthand
   * notations. For example:
   * - "14h30" -> Time(14, 30)
   * - "1430" -> Time(14, 30)
   * - "905" -> Time(9, 5)
   * - "11" -> Time(11, 0)
   * - "8" -> Time(8, 0)
   * 
   * Returns null if the token cannot be parsed as a valid time or is out of range.
   * The range here is 0-23 for hours and 0-59 for minutes.
   * 
   * @param token The time token to parse.
   * @returns The parsed Time object if successful, or null if parsing fails or the time is out of range.
   */
  private parseTimeToken(token: string): Time | null {
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
      Case: numeral only.
      Depending on the number of digits the interpretation differs:
      - 1-2 digits: hours only
      - 3-4 digits: last two are minutes, the others are hours
    */
    else if (/^\d{1,4}$/.test(strtime)) {
      if (strtime.length <= 2) {
        hours = Number(strtime);
        minutes = 0;
      } 
      else {
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


  /////////////// Best candidate selection logic ////////////////

  /**
   * Given the candidate matches for each token, this function explores 
   * all possible combinations of token assignments to fields (movie, theater, day, time) 
   * and scores them to find the best overall assignment.
   * 
   * @param candidatesList : all matches for each fields for a given token.
   * @returns 
   */
  private pickBestAssignment(candidatesList: TokenMatchCandidates[]): CandidateMaps {
    const empty = this.emptyCandidateMaps();
    let bestState = this.cloneCandidateMaps(empty);
    let bestScore: CandidateScore | null = null;

    /*
    * The visit function recursively explores all combinations of token assignments.
    * 
    */
    const visit = (index: number, state: CandidateMaps) => {
      if (index >= candidatesList.length) {
        const score = this.scoreState(state);
        if (!bestScore || this.isBetterScore(score, bestScore)) {
          bestScore = score;
          bestState = this.cloneCandidateMaps(state);
        }
        return;
      }

      const candidates = candidatesList[index];
      const fieldnames = this.matchedFieldnames(candidates);
      fieldnames.forEach(fieldname => {
        const nextState = this.cloneCandidateMaps(state);
        if (fieldname) {
          this.addCandidates(nextState, fieldname, candidates[fieldname]);
        }
        visit(index + 1, nextState);
      });
    };

    visit(0, empty);
    return bestState;
  }


  /**
   * Returns the list of fields that have candidates for the given token, 
   * prioritizing fields with a single candidate.
   * 
   * Priorities are:
   * 1. If the token has at least one field with a single candidate, only those fields are returned.
   * 2. Else, if the token has fields with multiple candidates, those fields are returned.
   * 3. Else, if the token has no candidates for any field, an array with a single null value is returned to indicate that this token does not contribute to any field.
   * 
   * -----
   * Note:
   * 
   * Previous vesrion of the algorithm would always include null as a possible fieldname
   * for each token. In effect, it allows the algorithm to "skip" the token and explore 
   * combinations where the token is ignored. The idea was to eliminate noisy tokens 
   * that could lower the score if they were forcibly assigned to a field even if that was clearly 
   * suboptimal (see 'pickBestAssignment' about the skip part) (see definition of suboptimal below).
   * 
   * However, the algorithm considers that no result is better than ambiguous results (see 'isBetterScore"). 
   * So even if a token would match something, the algorithm would prefer to skip it. 
   * In the end it would lead to situations where the user could enter a value for which she expects
   * at least some matches, but sees a "missing" label (no match) in the UI.
   *  
   * After having an argument with Copilot (we did not fight literally but had opposite views on what 
   * the correct behavior should be), I have chosen instead to return null only if there is absolutely no match. 
   * This avoid suprising results in the UI as explained above.
   * 
   * However I am keeping the previous version as dead code here in case my choice was a mistake.
   * 
   * @param candidates 
   * @returns 
   */
  private matchedFieldnames(candidates: TokenMatchCandidates): Array<FieldName | null> {
    // 1. Fields with a single candidate
    let fieldnames: FieldName[] = FIELD_NAMES.filter(field => candidates[field].length === 1);
    if (fieldnames.length > 0){
      return fieldnames;
    }
    // 2. Fields with multiple candidates
    fieldnames = FIELD_NAMES.filter(field => candidates[field].length > 0);
    if (fieldnames.length > 0){
      return fieldnames;
    }
    // 3. No candidates for any field
    return [null];

    /*
    // Pervious version, that always allows to skip ambiguous fields (see comment above):

    let candidateFields: FieldName[] = [];    
    const uniqueFields = FIELD_NAMES.filter(field => candidates[field].length === 1);
    if (uniqueFields.length > 0) {
      // exact matches
      candidateFields = uniqueFields;
    } else {
      // ambiguous matches
      candidateFields = FIELD_NAMES.filter(field => candidates[field].length > 0);
    }
    return [...candidateFields, null];
    */
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

  /**
   * Scores the current state of candidate maps by counting how many fields are correctly matched,
   * how many are ambiguous, how many are missing, and the total number of candidates.
   * 
   * @param state : the current candidate maps for movie, theater, day, and time
   * @returns : an object containing the counts of ok, ambiguous, missing, and total candidates across all fields
   */
  private scoreState(state: CandidateMaps): CandidateScore {
    let ok = 0;
    let ambiguous = 0;
    let missing = 0;
    let total = 0;
    for (const field of FIELD_NAMES) {
      const size = state[field].size;
      if (size === 1) ok++;
      if (size > 1) ambiguous++;
      if (size === 0) missing++;
      total += size;
    }
    return { ok, ambiguous, missing, total };
  }

  /**
   * Determines if the candidate score is better than the current best score. 
   * 
   * The comparison is based on the following criteria, in order of importance:
   * 1. How many fields are correctly matched (ok) - more is better
   * 2. How many fields are ambiguous (ambiguous) - fewer is better
   * 3. How many fields are missing (missing) - fewer is better
   * 4. Total number of candidates across all fields (total) - fewer is better
   * 
   * @param candidate the candidate score to compare
   * @param current the current best score
   * @returns true if the candidate score is better than the current score, false otherwise
   */
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



  // *************** small logic utils ******************* //

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

interface TokenMatchCandidates {
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