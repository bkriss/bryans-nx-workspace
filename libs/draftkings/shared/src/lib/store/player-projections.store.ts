import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { DfsPlatform } from '../enums';
import { FantasyFootballersProjections } from '../models';

/**
 * State for player scoring projections
 */
export interface PlayerProjectionsState {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  projections: PlayerProjections | null;
}

const initialState: PlayerProjectionsState = {
  error: null,
  isLoading: false,
  isSaving: false,
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
    (
      store,
      projectionsService = inject(PlayerProjectionsService),
      _matSnackBar = inject(MatSnackBar)
    ) => ({
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
      saveScoringProjectionsToFirestore(
        dfsPlatform: DfsPlatform,
        fantasyFootballersProjections: Partial<FantasyFootballersProjections>
      ): void {
        patchState(store, { isSaving: true, error: null });
        projectionsService
          .saveFantasyFootballersProjections(
            dfsPlatform,
            fantasyFootballersProjections
          )
          .pipe(
            tap(() => {
              _matSnackBar.open('Saved player scoring projections', 'Close');
            }),
            catchError((error) => {
              console.error(
                'Failed to save player scoring projections:',
                error
              );
              _matSnackBar.open(
                'Failed to save player scoring projections',
                'Close'
              );
              patchState(store, {
                error: 'Failed to save player scoring projections.',
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          )
          .subscribe();
      },
    })
  )
);
