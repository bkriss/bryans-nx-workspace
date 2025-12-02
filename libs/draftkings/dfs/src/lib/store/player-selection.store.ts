import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { tap, catchError, of, finalize } from 'rxjs';

import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
} from '../models/player.model';
import { SlatesStore } from './slates.store';
import { Slate } from '../enums';
import {
  PlayerPoolSelections,
  PlayerSelectionService,
} from './player-selection.service';

/**
 * State interface for player pools
 */
export interface PlayerSelectionState {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  quarterbacks: Quarterback[];
  runningBacks: RunningBack[];
  wideReceivers: PassCatcher[];
  tightEnds: PassCatcher[];
  defenses: Player[];
}

/**
 * Initial state for player pools
 */
const initialState: PlayerSelectionState = {
  error: null,
  isLoading: false,
  isSaving: false,
  quarterbacks: [],
  runningBacks: [],
  wideReceivers: [],
  tightEnds: [],
  defenses: [],
};

export const PlayerSelectionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    allPoolsAreSet: computed(
      () =>
        store.quarterbacks().length > 0 &&
        store.runningBacks().length > 0 &&
        store.wideReceivers().length > 0 &&
        store.tightEnds().length > 0 &&
        store.defenses().length > 0
    ),
  })),

  withMethods((store) => ({
    removeQuarterback(id: string): void {
      const updatedQbs = store.quarterbacks().filter((qb) => qb.id !== id);
      patchState(store, { quarterbacks: updatedQbs });
    },
    removeRunningBack(id: string): void {
      const updatedRbs = store.runningBacks().filter((rb) => rb.id !== id);
      patchState(store, { runningBacks: updatedRbs });
    },
    removeWideReceiver(id: string): void {
      const updatedWrs = store.wideReceivers().filter((wr) => wr.id !== id);
      patchState(store, { wideReceivers: updatedWrs });
    },
    removeTightEnd(id: string): void {
      const updatedTes = store.tightEnds().filter((te) => te.id !== id);
      patchState(store, { tightEnds: updatedTes });
    },
    removeDefense(id: string): void {
      const updatedDsts = store.defenses().filter((dst) => dst.id !== id);
      patchState(store, { defenses: updatedDsts });
    },
    setQuarterbacks(quarterbacks: Quarterback[]): void {
      patchState(store, { quarterbacks: [...quarterbacks] });
    },
    setRunningBacks(runningBacks: RunningBack[]): void {
      patchState(store, { runningBacks: [...runningBacks] });
    },
    setWideReceivers(wideReceivers: PassCatcher[]): void {
      patchState(store, { wideReceivers: [...wideReceivers] });
    },
    setTightEnds(tightEnds: PassCatcher[]): void {
      patchState(store, { tightEnds: [...tightEnds] });
    },
    setDefenses(defenses: Player[]): void {
      patchState(store, { defenses: [...defenses] });
    },
    clearAllPools(): void {
      patchState(store, initialState);
    },

    // clearPool(position: Position): void {
    //   switch (position) {
    //     case Position.QB:
    //       patchState(store, { selectedQuarterbacks: [] });
    //       break;
    //     case Position.RB:
    //       patchState(store, { selectedRunningBacks: [] });
    //       break;
    //     case Position.WR:
    //       patchState(store, { selectedWideReceivers: [] });
    //       break;
    //     case Position.TE:
    //       patchState(store, { selectedTightEnds: [] });
    //       break;
    //     case Position.DST:
    //       patchState(store, { selectedDefenses: [] });
    //       break;
    //   }
    // },
  })),

  // TODO: Refactor so there is only one instance of withMethods
  withMethods(
    (
      store,
      playerSelectionService = inject(PlayerSelectionService),
      slatesStore = inject(SlatesStore),
      _matSnackBar = inject(MatSnackBar)
    ) => ({
      loadSelectedPlayersFromFirestore(): void {
        const currentSlate: Slate = slatesStore.currentSlate();
        patchState(store, { isLoading: true, error: null });

        playerSelectionService
          .getPlayerPoolSelections(currentSlate)
          .pipe(
            tap((players: PlayerPoolSelections | null) => {
              if (players) {
                patchState(store, {
                  quarterbacks:
                    players.quarterbacks?.map((player) => ({
                      ...player,
                      gradeOutOfTen: +player.gradeOutOfTen,
                    })) ?? [],
                  runningBacks:
                    players.runningBacks?.map((player) => ({
                      ...player,
                      gradeOutOfTen: +player.gradeOutOfTen,
                    })) ?? [],
                  wideReceivers:
                    players.wideReceivers?.map((player) => ({
                      ...player,
                      gradeOutOfTen: +player.gradeOutOfTen,
                    })) ?? [],
                  tightEnds:
                    players.tightEnds?.map((player) => ({
                      ...player,
                      gradeOutOfTen: +player.gradeOutOfTen,
                    })) ?? [],
                  defenses:
                    players.defenses?.map((player) => ({
                      ...player,
                      gradeOutOfTen: +player.gradeOutOfTen,
                    })) ?? [],
                });
              }
            }),
            catchError((error) => {
              console.error(
                `Failed to load selected players for ${currentSlate} slate:`,
                error
              );
              patchState(store, {
                error: 'Failed to load selected players.',
                isLoading: false,
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
          .subscribe();
      },

      // TODO: Refactor so that we can patch each position separately without overwriting the others
      saveSelectedPlayersToFirestore(): void {
        const currentSlate: Slate = slatesStore.currentSlate();
        const selectedPlayers: PlayerPoolSelections = {
          quarterbacks: store.quarterbacks(),
          runningBacks: store.runningBacks(),
          wideReceivers: store.wideReceivers(),
          tightEnds: store.tightEnds(),
          defenses: store.defenses(),
        };

        patchState(store, { isSaving: true, error: null });
        playerSelectionService
          .saveSelectedPlayers(currentSlate, selectedPlayers)
          .pipe(
            tap(() => {
              _matSnackBar.open(
                `Saved selected players for ${currentSlate
                  .replace('_', ' ')
                  .toLowerCase()} slate`,
                'Close'
              );
            }),
            catchError((error) => {
              console.error(
                `Failed to save selected players for ${currentSlate} slate:`,
                error
              );
              _matSnackBar.open('Failed to save selected players', 'Close');
              patchState(store, { error: 'Failed to save selected players.' });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          )
          .subscribe();
      },
    })
  )
);
