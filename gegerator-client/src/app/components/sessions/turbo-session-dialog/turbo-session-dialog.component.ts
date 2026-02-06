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
   * and scores them to find the best overall assignment. The algorithm also explore the 
   * possibility of not using a token for any field a a mean to discard noisy (irrelevant)
   * tokens.
   * 
   * @param tokenMatchesList : all matches for each fields for a given token.
   * @returns 
   */
  private pickBestAssignment(tokenMatchesList: TokenMatchCandidates[]): CandidatesAccumulator {
    let bestState = CandidatesAccumulator.newEmpty();
    let bestScore: AccumulatorScore = WORST_SCORE;

    /*
    * The visit function recursively explores all combinations of token assignments, 
    * accumulating candidates for each field in the current state. When all tokens have been processed,
    * it scores the current state and updates the best state if the score is better than the current best score.
    */
    const visit = (index: number, currentState: CandidatesAccumulator) => {
      // Termination condition: once all candidates have been processed, 
      // we score the current state and update the best state if necessary
      if (index >= tokenMatchesList.length) {
        const score = currentState.score;
        if (this.isBetterScore(score, bestScore)) {
          bestScore = score;
          bestState = currentState.clone();
        }
        return;
      }

      // Else, accumulate all matched fields for the current token and 
      // recursively explore each possible assignment for the next token.
      // Also explore the possibility of not assigning the token to any 
      // field (null) to allow for noise reduction, see the "null" returned
      // in matchedFieldnames().
      const tokenMatches = tokenMatchesList[index];
      const fieldnames = this.matchedFieldnames(tokenMatches);
      fieldnames.forEach(fieldname => {
        const nextState = currentState.clone();
        if (fieldname) {
          nextState.addToField(fieldname, tokenMatches[fieldname]);
        }
        visit(index + 1, nextState);
      });
    };

    visit(0, CandidatesAccumulator.newEmpty());
    return bestState;
  }


  /**
   * Return the fieldnames that had at least one match for the given token:
   * - if there are fields with unique matches, return only those fields to favor unambiguous matches
   * - otherwise, return all fields that had at least one match to allow for ambiguity resolution 
   *   in the best assignment selection
   * 
   * Note: the returned array always includes null as a possible fieldname to allow for the possibility 
   * of not assigning the token to any field, which can be important for finding the best overall assignment 
   * when some tokens are irrelevant or do not match well with any field (see pickBestAssignment).
   * 
   * @param tokenMatches 
   * @returns 
   */
  private matchedFieldnames(tokenMatches: TokenMatchCandidates): Array<FieldName | null> {
    let candidateFields: FieldName[] = [];    
    const uniqueFields = FIELD_NAMES.filter(field => tokenMatches[field].length === 1);
    if (uniqueFields.length > 0) {
      // exact matches
      candidateFields = uniqueFields;
    } else {
      // ambiguous matches
      candidateFields = FIELD_NAMES.filter(field => tokenMatches[field].length > 0);
    }
    return [...candidateFields, null];
  }


  /**
   * Determines if the candidate score is better than the current best score. 
   * 
   * The comparison is based on the following criteria, in order of importance:
   * 1. How many fields are correctly matched (ok) - more is better
   * 2. How many fields are missing (missing) - fewer is better
   * 3. How many fields are ambiguous (ambiguous) - fewer is better
   * 4. Total number of candidates across all fields (total) - fewer is better
   * 
   * @param candidate the candidate score to compare
   * @param current the current best score
   * @returns true if the candidate score is better than the current score, false otherwise
   */
  private isBetterScore(candidate: AccumulatorScore, current: AccumulatorScore): boolean {
    if (candidate.ok !== current.ok) {
      return candidate.ok > current.ok;
    }
    if (candidate.missing !== current.missing) {
      return candidate.missing < current.missing;
    }
    if (candidate.ambiguous !== current.ambiguous) {
      return candidate.ambiguous < current.ambiguous;
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

interface AccumulatorScore {
  ok: number;
  ambiguous: number;
  missing: number;
  total: number;
}

const WORST_SCORE: AccumulatorScore = { ok: 0, ambiguous: 0, missing: FIELD_NAMES.length, total: 0 };

/**
 * CandidatesAccumulator holds all candidate values for each field (movie, theater, day, time) 
 * during the best assignment search process.
 *
 * Impl note: we use `Map<string, T>` instead of Sets/arrays so we can
 * - deduplicate candidates by a stable key (e.g. movie id, theater key, time string),
 * - cheaply clone and merge maps during recursive search (`new Map(old)`),
 * - get O(1) size/lookup and overwrite semantics via `set(key, value)`.
 * 
 * At the time of writing a Set would be fine as all objects have unique reference and unique content, 
 * but the use of a Map enforce uniqueness by a key we can control.
 */
class CandidatesAccumulator {
  constructor(
    public movie: Map<string, Movie>,
    public theater: Map<string, Theater>,
    public day: Map<string, Day>,
    public time: Map<string, Time>
  ) {}

  static newEmpty(): CandidatesAccumulator {
    return new CandidatesAccumulator(new Map(), new Map(), new Map(), new Map());
  }

  clone(): CandidatesAccumulator {
    return new CandidatesAccumulator(
      new Map(this.movie),
      new Map(this.theater),
      new Map(this.day),
      new Map(this.time)
    );
  }
  
  addToField(field: FieldName, candidates: unknown[]): void {
    switch (field) {
      case 'movie':
        const movieCandidates = candidates as Movie[];
        movieCandidates.forEach(movie => this.movie.set(String(movie.id), movie));
        break;
      case 'theater':
        const theaterCandidates = candidates as Theater[];
        theaterCandidates.forEach(theater => this.theater.set(theater.key, theater));
        break;
      case 'day':
        const dayCandidates = candidates as Day[];
        dayCandidates.forEach(day => this.day.set(day.key, day));
        break;
      case 'time':
        const timeCandidates = candidates as Time[];
        timeCandidates.forEach(time => this.time.set(Times.toString(time), time));
        break;
    }
  }

  /**
   * Scores the current state of candidate maps by counting how many fields are correctly matched,
   * how many are ambiguous, how many are missing, and the total number of candidates.
   * 
   * @param state : the current candidate maps for movie, theater, day, and time
   * @returns : an object containing the counts of ok, ambiguous, missing, and total candidates across all fields
   */
  get score(): AccumulatorScore {
    let ok = 0;
    let ambiguous = 0;
    let missing = 0;
    let total = 0;
    for (const field of FIELD_NAMES) {
      const size = this[field].size;
      if (size === 0) missing++;
      if (size === 1) ok++;
      if (size > 1) ambiguous++;
      total += size;
    }
    return { ok, ambiguous, missing, total };
  }

}