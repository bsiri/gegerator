
import { FestivalRoadmap as RoadmapData, RoadmapAuthor, RoadmapData } from "src/app/models/roadmap.model";
import { Mode } from "../appstate-models/mode.model";
import { signalStore, withState, withHooks, withMethods, patchState, withComputed } from '@ngrx/signals';
import { selectPlannedMovieSessions } from "../selectors/session.selectors";
import { computed, inject } from "@angular/core";
import { State, Store } from "@ngrx/store";
import { selectActivities } from "../selectors/activity.selectors";
import { PlannedMovieSession } from "src/app/models/session.model";
import { OtherActivity } from "src/app/models/activity.model";
import { __importDefault } from "tslib";
import { EventRatings } from "src/app/models/plannable.model";

/*
    Global store for managing the selected Mode for the wizard and the wizard generated
    roadmap. It also exposes signals for exposing roadmaps.
    
    It partly replaces the previous ngrx stack that were managing these two separately, 
    but does not substitute to ngrx completely because the global migration to signal 
    store has not started (and may very well never happen).

    Finally, this is a global store, provided in the root provider, because that state 
    needs to be unique throughout the app.

*/


interface RoadmapState {
    // all are private
    _mode: Mode,
    _wizardRoadmap: RoadmapData,
}

const initialState: RoadmapState = {
    _mode: Mode.MANUAL,
    _wizardRoadmap: {
        sessionIds: [],
        activityIds: []
    }
}


/*************************************************
 *  Hacky boilerplate: 
 * to access the other ngrx selectors I need, 
 * I first need to access the store (the vanilla 
 * ngrx store that serves the rest of the app).
 * 
 * I don't like it really but at the moment I don't 
 * know any other way.
 * 
 */

export const RoadmapStore = signalStore(
    {providedIn: "root"},
    withState(initialState),
    withMethods((store) => {
        return {
            toggleMode() {
                const newMode = (store._mode() == Mode.MANUAL) ? Mode.WIZARD : Mode.MANUAL
                patchState(store, (state) => ({
                    _mode: newMode
                }))
            }, 
            updateWizardRoadmap(newRoadmap: RoadmapData){
                patchState(store, {
                    _wizardRoadmap: newRoadmap
                })
            } 
        }
    }),
    withComputed((state) => {

        // *** inject the ngrx selectors we need *** //
        const ngrxStore = inject(Store)
        const $sessions = ngrxStore.selectSignal(selectPlannedMovieSessions)
        const $activities = ngrxStore.selectSignal(selectActivities)

        // *** computed signals sections *** //
        const $userRoadmap = computed(()=>{
            return new RoadmapData(
                RoadmapAuthor.HUMAN,
                $sessions().filter(session => session.rating == EventRatings.MANDATORY),
                $activities().filter(act => act.rating = EventRatings.MANDATORY)
            )
        })
        const $wizardRoadmap = computed(() => {
            return new RoadmapData(
                RoadmapAuthor.MACHINE,
                $sessions().filter(session => state._wizardRoadmap.sessionIds().includes(session.id)),
                $activities().filter(act => state._wizardRoadmap.activityIds().includes(act.id))
            )
        })
        const $activeRoadmap = computed(() => {
            return (state._mode() == Mode.MANUAL) ? $userRoadmap() : $wizardRoadmap()
        })

        // *** final properties object *** //
        return {
            /**
             * Returns the current mode
             */
            $mode: state._mode,
            /**
             * Returns the Roadmap that consists of 
             * all OtherActivities and all PlannedMovieSession
             * that were handpicked by the user as MANDATORY 
             */
            $userRoadmap: $userRoadmap,
            /**
             * Returns the Roadmap that consists of the 
             * all OtherActivities and all PlannedMovieSession
             * recommanded by the wizard
             */
            $wizardRoadmap: $wizardRoadmap,
            /**
             * Returns the Roadmap currently selected according to the chose mode
             * (this is usually the one you want)
             */
            $activeRoadmap: $activeRoadmap,
        }

    })
    

)
