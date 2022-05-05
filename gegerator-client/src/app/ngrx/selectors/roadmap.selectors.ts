import { createSelector } from "@ngrx/store";
import { FestivalRoadmap } from "src/app/models/roadmap.model";
import { MovieSessionRating, MovieSessionRatings } from "src/app/models/session.model";
import { selectActivitieslist } from "./activity.selectors";
import { selectMovieslist } from "./movie.selectors";
import { selectPlannedMovieSession } from "./session.selectors";


/**
 * Returns the Roadmap that consists of 
 * all OtherActivities and all PlannedMovieSession
 * that were handpicked by the user as MANDATORY 
 */
export const userRoadmap = createSelector(
    selectPlannedMovieSession, 
    selectActivitieslist,
    (sessions, activities) => {
        return new FestivalRoadmap(
            sessions.filter(session => session.rating == MovieSessionRatings.MANDATORY),
            activities
        )
    }
)