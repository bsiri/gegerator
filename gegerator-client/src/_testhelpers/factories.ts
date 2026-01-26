import { MovieRatings, Movie, MovieRating } from "src/app/models/movie.model"
import { EventRating, EventRatings } from "src/app/models/plannable.model"
import { Day, Days, Theater, Theaters } from "src/app/models/referential.data"
import { Time } from "src/app/models/time.model"
import { PLANNABLE_EVENT_TIME_INTERVAL } from "src/app/components/sessions/session-day-boundaries.model"
import { Duration } from "iso8601-duration"
import { PlannedMovieSession } from "src/app/models/session.model"
import { OtherActivity } from "src/app/models/activity.model"


// ************ Test data factories ************

export type MovieSpec =  Partial<Movie>
export type PlannedMovieSessionSpec = Partial<PlannedMovieSession>
export type OtherActivitySpec = Partial<OtherActivity>


/**
 * Returns a default Movie instance, with optional overrides. Use it when you 
 * need a reference instance with known properties, with slight variations if 
 * you provide overrides.
 * 
 * The default movie has:
 * - id: 1
 * - title: "Default Movie Title"
 * - duration: 1 hour 30 minutes
 * - rating: MovieRatings.DEFAULT
 * 
 * @param overrides {MovieSpec}
 * @returns {Movie}
 */
export function defaultMovie(overrides: MovieSpec = {}): Movie {
    const defaultMovie = new Movie(
        1,
        "Default Movie Title",
        { hours: 1, minutes: 30 },
        MovieRatings.DEFAULT
    )
    return Object.assign(defaultMovie, overrides)
}

/**
 * Returns a random Movie instance, with optional overrides. Use it when you
 * don't really care about the specific properties of the movie aside from 
 * what you explicitly override.
 * 
 * Using someMovie() in your test (as opposed to defaultMovie()) emphasize that
 * non-overriden properties are not relevant for the test, and one should pay 
 * more attention to what is overriden and how it affects the test setup and 
 * outcome.
 * 
 * The random movie has:
 * - id: random > 0
 * - title: random title
 * - duration: random between 1 and 3 hours, minutes by steps of 15
 * - rating: random MovieRating
 * 
 * @param overrides {MovieSpec}
 * @returns {Movie}
 */
export function someMovie(overrides: MovieSpec = {}): Movie {
    const movie = new Movie(
        randomId(),
        randomTitle(),
        randomDuration(1, 3),
        randomMovieRating()
    )
    return Object.assign(movie, overrides)
}


/**
 * Returns a default PlannedMovieSession instance, with optional overrides. Use it when you
 * need a reference instance with known properties, with slight variations if
 * you provide overrides.
 * 
 * The default session has:
 * - id: 1
 * - movie: defaultMovie()
 * - theater: Theaters.ESPACE_LAC
 * - day: Days.WEDNESDAY
 * - time: 10h00
 * 
 * @param overrides 
 * @returns 
 */
export function defaultSession(overrides: PlannedMovieSessionSpec = {}): PlannedMovieSession {
    const defaultSession = new PlannedMovieSession(
        1,
        defaultMovie(),
        Theaters.ESPACE_LAC,
        Days.WEDNESDAY,
        new Time(10, 0),
        EventRatings.DEFAULT
    )
    return Object.assign(defaultSession, overrides)
}

/**
 *  Returns a random PlannedMovieSession instance, with optional overrides. Use it when you
 * don't really care about the specific properties of the session aside from
 * what you explicitly override.
 * 
 * Using someSession() in your test (as opposed to defaultSession()) emphasize that
 * non-overriden properties are not relevant for the test, and one should pay
 * more attention to what is overriden and how it affects the test setup and
 * outcome.
 * 
 * The random session has:
 * - id: random > 0
 * - movie: someMovie()
 * - theater: random Theater
 * - day: random Day
 * - time: random Time
 *  
 * @param overrides {PlannedMovieSessionSpec}
 * @returns {PlannedMovieSession}
 */
export function someSession(overrides: PlannedMovieSessionSpec = {}): PlannedMovieSession {
    const session = new PlannedMovieSession(
        randomId(),
        someMovie(),
        randomTheater(),
        randomDay(),
        randomTime(),
        randomEventRating()
    )
    return Object.assign(session, overrides)
}


/**
 * Utility for mass-producing PlannedMovieSession instances sharing common specs.
 * The non-specified attributes will be random (using the "someX" factory). The 
 * builder accumulate the sessions in a buffer until you invoke "done()".
 * 
 * This fluent builder is verbose, but allows to clearly express the intent of the 
 * test data. Use it if you think the tradeoff is worth it, for simpler usage
 * using someSession() or even direct constructor calls might be preferable.
 * 
 * # Basic usage
 * The entry point to the builder is the "for" method, in which you pass the 
 * initial session specs.
 * 
 * Then, use the following methods
 * - add(specs): creates a random session with the given specs and add it 
 *   to the buffer.
 * - add(session): adds the given session directly to the buffer.
 * - done(): returns the buffer then reinitialize it
 * 
 * # Sub builders
 * One can create sub scopes (sub builders) that inherit the specs of its
 * parent builder:
 * - with(additionalSpecs): returns a scoped sub builder
 * - done(): aggregates its sessions to the parent builder, then returns 
 *   the parent builder.
 * 
 * # Examples:
 * Make a bunch of session for the same movie
 * ```typescript
 * // make random sessions for the same movie
 * const builder = sessionBuilder().for({movie: someMovie()})
 * const [session1, session2] = builder.add().add().done()
 * ```
 * 
 * Use of sub builders
 * ```typescript
 * const [session1, session2, session3] = sessionBuilder()
 *                      .for({ movie: someMovie()})
 *                          .with({day: Days.FRIDAY})
 *                              .add({startTime: Times.fromString("10h30")})
 *                              .add({startTime: Times.fromString("14h30")})
 *                          .done()
 *                          .with({theater: Theaters.CASINO})
 *                              .add()
 *                          .done()
 *                      .done()
 * ```
 * 
 * @returns 
 */
export function sessionBuilder() {
    return {
        for: (specs: PlannedMovieSessionSpec = {}) =>{
            return new SessionBuilder(specs)
        }
    }
}

class SessionBuilder{
    sessions: PlannedMovieSession[] = []
    constructor (private specs: PlannedMovieSessionSpec = {}, private parent?: SessionBuilder){}
    
    with(subSpecs: PlannedMovieSessionSpec){
        return new SessionBuilder({...this.specs, ...subSpecs}, this)
    }

    add(session: PlannedMovieSession): SessionBuilder
    add(specs?: PlannedMovieSessionSpec): SessionBuilder
    add(sessionOrSpecs: PlannedMovieSession | PlannedMovieSessionSpec={}): SessionBuilder{
        if (sessionOrSpecs instanceof PlannedMovieSession){
            this.sessions.push(sessionOrSpecs)
            return this
        }
        else{
            const effectiveSpecs = {...this.specs, ...sessionOrSpecs}
            this.sessions.push(someSession(effectiveSpecs))
            return this
        }
    }
    done(){
        if (this.parent != undefined){
            this.parent.sessions = this.parent.sessions.concat(this.sessions)
            return this.parent
        }
        else{
            const res = this.sessions.slice()
            this.sessions = []
            return res
        }
    }
}




/**
 * Returns a default OtherActivity instance, with optional overrides. Use it when you
 * need a reference instance with known properties, with slight variations if
 * you provide overrides.
 * 
 * The default activity has:
 * - id: 1
 * - day: Days.WEDNESDAY
 * - startTime: 12h00
 * - endTime: 13h00
 * - title: "Default Activity"
 * - rating: EventRatings.DEFAULT
 * 
 * @param overrides {OtherActivitySpec}
 * @returns {OtherActivity}
 */
export function defaultActivity(overrides: OtherActivitySpec = {}): OtherActivity {
    const defaultActivity = new OtherActivity(
        1,
        Days.WEDNESDAY,
        new Time(12, 0),
        new Time(13, 0),
        "Default Activity",
        EventRatings.DEFAULT
    )
    return Object.assign(defaultActivity, overrides)
}

/**
 * Returns a random OtherActivity instance, with optional overrides. Use it when you
 * don't really care about the specific properties of the activity aside from
 * what you explicitly override.
 * 
 * Using someActivity() in your test (as opposed to defaultActivity()) emphasize that
 * non-overriden properties are not relevant for the test, and one should pay
 * more attention to what is overriden and how it affects the test setup and
 * outcome.
 * 
 * The random activity has:
 * - id: random > 0
 * - day: random Day
 * - startTime: random Time
 * - endTime: random Time after startTime
 * - description: random title
 * - rating: random EventRating
 * 
 * @param overrides {OtherActivitySpec}
 * @returns {OtherActivity}
 */
export function someActivity(overrides: OtherActivitySpec = {}): OtherActivity {
    const startTime = randomTime()
    const endTime = randomTime(startTime)
    const activity = new OtherActivity(
        randomId(),
        randomDay(),
        startTime,
        endTime,
        randomTitle(),
        randomEventRating()
    )
    return Object.assign(activity, overrides)
}

// ************ Random data generators ************

/**
 * Returns a random id > 0
 * 
 */
export function randomId(): number {
    return Math.floor(Math.random() * 10000) + 1
}

/**
 * Returns a random Day from the Days enumeration.
 * 
 * @returns 
 */
export function randomDay(): Day {
    const allDays = Days.enumerate()
    const index = Math.floor(Math.random() * allDays.length)
    return allDays[index]
}

/**
 * Returns a random Theater from the Theaters enumeration.
 */
export function randomTheater(): Theater {
    const allTheaters = Theaters.enumerate()
    const index = Math.floor(Math.random() * allTheaters.length)
    return allTheaters[index]
}

/**
 * Returns a random time, within PLANNABLE_EVENT_TIME_INTERVAL from app/components/sessions/session-day-boundaries.component.ts limits.
 * If `after` is provided, the time will be after the given time.
 * @param after 
 */
export function randomTime(after?: Time, before?: Time): Time {
    const mintimeMinutes = PLANNABLE_EVENT_TIME_INTERVAL.start.toMinutes()
    const maxtimeMinutes = PLANNABLE_EVENT_TIME_INTERVAL.end.toMinutes()
    
    const afterMinutes = after ? after.toMinutes() : mintimeMinutes
    const beforeMinutes = before ? before.toMinutes() : maxtimeMinutes

    const randomMinutes = Math.floor(Math.random() * (beforeMinutes - afterMinutes)) + afterMinutes

    const hours = Math.floor(randomMinutes / 60)
    const minutes = randomMinutes % 60

    return new Time(hours, minutes)
}

/**
 * Returns a random Duration, with hours between minHours and maxHours.
 * Default interval is [0, 5] hours.
 * 
 * @param minHours
 * @param maxHours 
 * @returns 
 */
export function randomDuration(minHours: number = 0, maxHours: number = 5): Duration {
    const minHoursValue = minHours ?? 0
    const maxHoursValue = maxHours ?? 5

    const minHoursFinal = Math.max(0, minHoursValue)
    const maxHoursFinal = Math.max(minHoursFinal, maxHoursValue)
    const hours = Math.floor(Math.random() * (maxHoursFinal - minHoursFinal + 1)) + minHoursFinal
    const minutesOptions = [0, 15, 30, 45]
    const minutes = minutesOptions[Math.floor(Math.random() * minutesOptions.length)]
    return { hours, minutes }
}

/**
 * Returns a random EventRating from the EventRatings enumeration.
 * @returns 
 */
export function randomEventRating(): EventRating {
    const allRatings = EventRatings.enumerate()
    const index = Math.floor(Math.random() * allRatings.length)
    return allRatings[index]
}

/**
 * Returns a random MovieRating from the MovieRatings enumeration.
 * @returns 
 */
export function randomMovieRating(): MovieRating {
    const allRatings = MovieRatings.enumerate()
    const index = Math.floor(Math.random() * allRatings.length)
    return allRatings[index]
}

/**
 * Returns a random movie title.
 * @returns 
 */
export function randomTitle(): string {
    const adjectives = ["Amazing", "Incredible", "Fantastic", "Mysterious", "Epic", "Legendary", "Fascinating", "Thrilling"]
    const nouns = ["Adventure", "Journey", "Saga", "Quest", "Chronicles", "Tale", "Story", "Odyssey"]

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]

    return `${adjective} ${noun}`
}

