import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, of } from 'rxjs';
import {
  PlayerProjectionsService,
  PlayerProjections,
} from './player-projections.service';

/**
 * State for player scoring projections
 */
export interface PlayerProjectionsState {
  error: string | null;
  isLoading: boolean;
  projections: PlayerProjections | null;
}

const initialState: PlayerProjectionsState = {
  error: null,
  isLoading: false,
  projections: null,
};

export const PlayerProjectionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    quarterbacks: computed(() => store.projections()?.quarterbacks ?? []),
    runningBacks: computed(() => store.projections()?.runningBacks ?? []),
    wideReceivers: computed(() => store.projections()?.wideReceivers ?? []),
    tightEnds: computed(() => store.projections()?.tightEnds ?? []),
    dsts: computed(() => store.projections()?.dsts ?? []),
    hasData: computed(() => !!store.projections()),
  })),

  withMethods(
    (store, projectionsService = inject(PlayerProjectionsService)) => ({
      /**
       * Loads player scoring projections from Cloud Function.
       * Uses rxMethod to interop with the Observable service while maintaining signal state.
       */
      loadPlayerScoringProjections: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, {
              error: null,
              isLoading: true,
            })
          ),
          switchMap(() =>
            projectionsService.getPlayerScoringProjections().pipe(
              tap((projections) =>
                patchState(store, {
                  projections,
                })
              ),
              catchError((err: unknown) => {
                const message =
                  err && typeof err === 'object' && 'message' in err
                    ? String((err as { message?: unknown }).message)
                    : 'Failed to load player projections';
                patchState(store, { error: message });
                return of(null);
              }),
              finalize(() => patchState(store, { isLoading: false }))
            )
          )
        )
      ),
    })
  )
);
