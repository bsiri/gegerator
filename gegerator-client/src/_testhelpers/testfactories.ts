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
 * Returns a default Movie instance, with optional overrides.
 * 
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
 * Returns a random Movie instance, with optional overrides.
 * @param overrides 
 * @returns 
 */
export function randomMovie(overrides: MovieSpec = {}): Movie {
    const movie = new Movie(
        randomId(),
        randomTitle(),
        randomDuration(1, 3),
        randomMovieRating()
    )
    return Object.assign(movie, overrides)
}

export function defaultPlannedMovieSession(overrides: PlannedMovieSessionSpec = {}): PlannedMovieSession {
    const defaultSession = new PlannedMovieSession(
        1,
        defaultMovie(),
        Theaters.ESPACE_LAC,
        randomDay(),
        new Time(10, 0),
        EventRatings.DEFAULT
    )
    return Object.assign(defaultSession, overrides)
}

export function randomPlannedMovieSession(overrides: PlannedMovieSessionSpec = {}): PlannedMovieSession {
    const session = new PlannedMovieSession(
        randomId(),
        randomMovie(),
        randomTheater(),
        randomDay(),
        randomTime(),
        randomEventRating()
    )
    return Object.assign(session, overrides)
}

export function defaultOtherActivity(overrides: OtherActivitySpec = {}): OtherActivity {
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

export function randomOtherActivity(overrides: OtherActivitySpec = {}): OtherActivity {
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