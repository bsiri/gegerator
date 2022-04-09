import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MovielistService } from "../../services/movielist.service";
import { MovieActions } from "../actions/movie.actions";
import { map, mergeMap } from "rxjs";

@Injectable()
export class MovieEffects {

    constructor(
        private actions$: Actions,
        private service: MovielistService
    ){}

    reload$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.reload_movies),
        mergeMap(() => this.service.getAll()
            .pipe(
                map(movies => MovieActions.movies_reloaded({movies}))
            )
        )
    ));   

    create$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.create_movie),
        mergeMap(action => this.service.save(action.movie)
            .pipe(
                map(response => MovieActions.movie_created({movie: response}))
            )
        )
    ));

    update$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.update_movie),
        mergeMap(action => this.service.update(action.movie)
            .pipe(
                map(response => MovieActions.movie_updated({movie: response}))
            )        
        )
    ));

    delete$ = createEffect(() => this.actions$.pipe(
        ofType(MovieActions.delete_movie),
        mergeMap(action => this.service.delete(action.movie)
            .pipe(
                map(delmovie => MovieActions.movie_deleted({movie: delmovie}))
            )
        )
    ));


    /** ******************************************************************
    Noob note : in order to make sense of mergeMap, here are a few notes.

    Taking 'update$' as an example, the action we need to perform is :
    ```
        action => this.service.update(action.movie)
            .pipe(
                map(response => MovieActions.movie_updated({movie: response}))
            )    
    ```
    this means : call the service and then map the result to an Obvservable 
    of type Action<{movie}>. Bottom line, the snippet returns an Observable.


    So in the code around it: 
    ```
        this.actions$.pipe(
            ofType(MovieActions.update_movie),
            mergeMap(action => ...)
        )
    ```
    we cannot swap 'map' for 'mergeMap' because 'map' would then return 
    an Observable<Observable<Action>> (because 'map' wraps the result in 
    an Observable). This is not the type we need.

    So, using 'map' instead of 'mergeMap', in order to effectively return 
    the intended Observable<Action> we would need to invoke an extra 
    'mergeAll' that would flatten the nested Observable :

    ```
        ...
        map(action => this.service.update(action.movie)
            .pipe(
                map(response => MovieActions.movie_updated({movie: response}))
            )
        ),
        mergeAll()
    ```

    See: https://medium.com/@damianczapiewski/rxjs-merge-vs-mergeall-vs-mergemap-7d8f40fc4756


    More notes:
    We could also have manually unrolled the whole thing into:
    - calling the service,
    - subscribing to the Observable A,
    - push the content into a new Observable B,
    - and returning the Observable B.

    ```
    update$ = createEffect(() => {
        const subject = new Subject<Action>()
        this.actions$.pipe(
            ofType(MovieActions.update_movie)
        )
        .subscribe(action => {
            this.service.update(action.movie)
            .subscribe(m => 
                subject.next(MovieActions.movie_updated({movie: m}))
            )
        })
        return subject;
    });
    ```
    *************************************************************/


}