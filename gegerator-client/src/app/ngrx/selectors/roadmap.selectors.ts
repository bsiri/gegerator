import { createFeatureSelector, createSelector } from "@ngrx/store";
import { EventRatings } from "src/app/models/plannable.model";
import { FestivalRoadmap, RoadmapAuthor, RoadmapData } from "src/app/models/roadmap.model";
import { Mode } from "../appstate-models/mode.model";
import { selectActivitieslist } from "./activity.selectors";
import { selectMode } from "./mode.selectors";
import { selectPlannedMovieSession } from "./session.selectors";


export const selectWizardRoadmapData = createFeatureSelector<RoadmapData>('wizardroadmap')

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
            activities.filter(act => act.rating == EventRatings.MANDATORY),
        )
    }
)


/**
 * Returns the Roadmap that consists of the 
 * all OtherActivities and all PlannedMovieSession
 * recommanded by the wizard
 */

export const selectWizardRoadmap = createSelector(
    selectPlannedMovieSession,
    selectActivitieslist,
    selectWizardRoadmapData,
    (sessions, activities, wizardroadmapdata) => {
        return new FestivalRoadmap(
            RoadmapAuthor.MACHINE,
            sessions.filter(session => wizardroadmapdata.sessionIds.includes(session.id)),
            activities.filter(act => wizardroadmapdata.activityIds.includes(act.id))
        )
    }
)


export const selectActiveRoadmap = createSelector(
    selectMode, 
    selectUserRoadmap,
    selectWizardRoadmap,
    (mode, userRoadmap, wizardRoadmap) =>{
        return (mode == Mode.MANUAL) ? userRoadmap : wizardRoadmap
    }
)