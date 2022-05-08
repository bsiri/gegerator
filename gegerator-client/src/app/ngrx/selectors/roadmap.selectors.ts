import { createSelector } from "@ngrx/store";
import { EventRatings } from "src/app/models/plannable.model";
import { FestivalRoadmap, RoadmapAuthor } from "src/app/models/roadmap.model";
import { selectActivitieslist } from "./activity.selectors";
import { selectPlannedMovieSession } from "./session.selectors";


/**
 * Returns the Roadmap that consists of 
 * all OtherActivities and all PlannedMovieSession
 * that were handpicked by the user as MANDATORY 
 */
export const selectUserRoadmap = createSelector(
    selectPlannedMovieSession, 
    selectActivitieslist,
    (sessions, activities) => {
        return new FestivalRoadmap(
            RoadmapAuthor.HUMAN,
            sessions.filter(session => session.rating == EventRatings.MANDATORY),
            activities
        )
    }
)