import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { tap, catchError, of } from 'rxjs';

import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
} from '../models/player.model';
import { PlayerPoolsService } from './player-pools.service';
import { SlatesStore } from './slates.store';
import { Position } from '../enums';

/**
 * State interface for player pools
 */
export interface PlayerPoolsState {
  error: string | null;
  isLoading: boolean;
  selectedQuarterbacks: Quarterback[];
  selectedRunningBacks: RunningBack[];
  selectedWideReceivers: PassCatcher[];
  selectedTightEnds: PassCatcher[];
  selectedDefenses: Player[];
}

/**
 * Initial state for player pools
 */
const initialState: PlayerPoolsState = {
  error: null,
  isLoading: false,
  selectedQuarterbacks: [],
  selectedRunningBacks: [],
  selectedWideReceivers: [],
  selectedTightEnds: [],
  selectedDefenses: [],
};

export const PlayerPoolsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    allPoolsAreSet: computed(
      () =>
        store.selectedQuarterbacks().length > 0 &&
        store.selectedRunningBacks().length > 0 &&
        store.selectedWideReceivers().length > 0 &&
        store.selectedTightEnds().length > 0 &&
        store.selectedDefenses().length > 0
    ),
  })),

  withMethods((store) => ({
    removeQuarterback(id: string): void {
      const updatedQbs = store
        .selectedQuarterbacks()
        .filter((qb) => qb.id !== id);
      patchState(store, { selectedQuarterbacks: updatedQbs });
    },
    removeRunningBack(id: string): void {
      const updatedRbs = store
        .selectedRunningBacks()
        .filter((rb) => rb.id !== id);
      patchState(store, { selectedRunningBacks: updatedRbs });
    },
    removeWideReceiver(id: string): void {
      const updatedWrs = store
        .selectedWideReceivers()
        .filter((wr) => wr.id !== id);
      patchState(store, { selectedWideReceivers: updatedWrs });
    },
    removeTightEnd(id: string): void {
      const updatedTes = store.selectedTightEnds().filter((te) => te.id !== id);
      patchState(store, { selectedTightEnds: updatedTes });
    },
    removeDefense(id: string): void {
      const updatedDsts = store
        .selectedDefenses()
        .filter((dst) => dst.id !== id);
      patchState(store, { selectedDefenses: updatedDsts });
    },
    setQuarterbacks(quarterbacks: Quarterback[]): void {
      patchState(store, { selectedQuarterbacks: [...quarterbacks] });
    },
    setRunningBacks(runningBacks: RunningBack[]): void {
      patchState(store, { selectedRunningBacks: [...runningBacks] });
    },
    setWideReceivers(wideReceivers: PassCatcher[]): void {
      patchState(store, { selectedWideReceivers: [...wideReceivers] });
    },
    setTightEnds(tightEnds: PassCatcher[]): void {
      patchState(store, { selectedTightEnds: [...tightEnds] });
    },
    setDefenses(defenses: Player[]): void {
      patchState(store, { selectedDefenses: [...defenses] });
    },
    // updateQuarterback(updatedQb: Quarterback): void {
    //   const updatedQbs = store
    //     .quarterbacks()
    //     .map((qb) => (qb.id === updatedQb.id ? updatedQb : qb));
    //   patchState(store, { quarterbacks: updatedQbs });
    // },
    // updateRunningBack(updatedRb: RunningBack): void {
    //   const updatedRbs = store
    //     .runningBacks()
    //     .map((rb) => (rb.id === updatedRb.id ? updatedRb : rb));
    //   patchState(store, { runningBacks: updatedRbs });
    // },
    // updateWideReceiver(updatedWr: PassCatcher): void {
    //   const updatedWrs = store
    //     .wideReceivers()
    //     .map((wr) => (wr.id === updatedWr.id ? updatedWr : wr));
    //   patchState(store, { wideReceivers: updatedWrs });
    // },
    // updateTightEnd(updatedTe: PassCatcher): void {
    //   const updatedTes = store
    //     .tightEnds()
    //     .map((te) => (te.id === updatedTe.id ? updatedTe : te));
    //   patchState(store, { tightEnds: updatedTes });
    // },
    // updateDefense(updatedDst: Player): void {
    //   const updatedDsts = store
    //     .defenses()
    //     .map((dst) => (dst.id === updatedDst.id ? updatedDst : dst));
    //   patchState(store, { defenses: updatedDsts });
    // },
    clearAllPools(): void {
      patchState(store, initialState);
    },

    clearPool(position: Position): void {
      switch (position) {
        case Position.QB:
          patchState(store, { selectedQuarterbacks: [] });
          break;
        case Position.RB:
          patchState(store, { selectedRunningBacks: [] });
          break;
        case Position.WR:
          patchState(store, { selectedWideReceivers: [] });
          break;
        case Position.TE:
          patchState(store, { selectedTightEnds: [] });
          break;
        case Position.DST:
          patchState(store, { selectedDefenses: [] });
          break;
      }
    },
  })),

  // TODO: Refactor so there is only one instance of withMethods
  withMethods(
    (
      store,
      playerPoolsService = inject(PlayerPoolsService),
      slatesStore = inject(SlatesStore),
      _matSnackBar = inject(MatSnackBar)
    ) => ({
      loadPlayerPoolsFromFirestore(): void {
        patchState(store, { isLoading: true, error: null });
        const currentSlate = slatesStore.currentSlate();

        playerPoolsService
          .getPlayerPools(currentSlate)
          .pipe(
            tap((playerPools) => {
              // console.log('Fetched player pools from Firestore:', playerPools);
              if (playerPools) {
                patchState(store, {
                  error: null,
                  isLoading: false,
                  selectedQuarterbacks:
                    playerPools.quarterbacks.map((qb) => ({
                      ...qb,
                      gradeOutOfTen: +qb.gradeOutOfTen,
                      maxNumberOfTeammatePasscatchers:
                        +qb.maxNumberOfTeammatePasscatchers,
                      minNumberOfTeammatePasscatchers:
                        +qb.minNumberOfTeammatePasscatchers,
                    })) || [],
                  selectedRunningBacks:
                    playerPools.runningBacks.map((rb) => ({
                      ...rb,
                      gradeOutOfTen: +rb.gradeOutOfTen,
                      maxOwnershipPercentage: +rb.maxOwnershipPercentage,
                      minOwnershipPercentage: +rb.minOwnershipPercentage,
                    })) || [],
                  selectedWideReceivers:
                    playerPools.wideReceivers.map((wr) => ({
                      ...wr,
                      gradeOutOfTen: +wr.gradeOutOfTen,
                      maxOwnershipPercentage: +wr.maxOwnershipPercentage,
                      maxOwnershipWhenPairedWithOpposingQb: +(
                        wr.maxOwnershipWhenPairedWithOpposingQb || 0
                      ),
                      maxOwnershipWhenPairedWithQb: +(
                        wr.maxOwnershipWhenPairedWithQb || 0
                      ),
                      minOwnershipPercentage: +wr.minOwnershipPercentage,
                      minOwnershipWhenPairedWithOpposingQb: +(
                        wr.minOwnershipWhenPairedWithOpposingQb || 0
                      ),
                      minOwnershipWhenPairedWithQb: +(
                        wr.minOwnershipWhenPairedWithQb || 0
                      ),
                    })) || [],
                  selectedTightEnds:
                    playerPools.tightEnds.map((te) => ({
                      ...te,
                      gradeOutOfTen: +te.gradeOutOfTen,
                      maxOwnershipPercentage: +te.maxOwnershipPercentage,
                      maxOwnershipWhenPairedWithOpposingQb: +(
                        te.maxOwnershipWhenPairedWithOpposingQb || 0
                      ),
                      maxOwnershipWhenPairedWithQb: +(
                        te.maxOwnershipWhenPairedWithQb || 0
                      ),
                      minOwnershipPercentage: +te.minOwnershipPercentage,
                      minOwnershipWhenPairedWithOpposingQb: +(
                        te.minOwnershipWhenPairedWithOpposingQb || 0
                      ),
                      minOwnershipWhenPairedWithQb: +(
                        te.minOwnershipWhenPairedWithQb || 0
                      ),
                    })) || [],
                  selectedDefenses:
                    playerPools.defenses.map((dst) => ({
                      ...dst,
                      gradeOutOfTen: +dst.gradeOutOfTen,
                      maxOwnershipPercentage: +dst.maxOwnershipPercentage,
                      minOwnershipPercentage: +dst.minOwnershipPercentage,
                    })) || [],
                });
                console.log(
                  `Successfully loaded player pools from Firestore for ${currentSlate} slate`
                );
              } else {
                console.log(
                  `No player pools found in Firestore for ${currentSlate} slate`
                );
                // Clear the store if no data exists
                patchState(store, initialState);
              }
            }),
            catchError((error) => {
              console.error(
                `Failed to load player pools for ${currentSlate} slate:`,
                error
              );
              patchState(store, {
                error: 'Failed to load player pools.',
                isLoading: false,
              });
              return of(null);
            })
          )
          .subscribe();
      },
      savePlayerPoolsToFirestore(): void {
        const currentSlate = slatesStore.currentSlate();
        const playerPools = {
          quarterbacks: store.selectedQuarterbacks(),
          runningBacks: store.selectedRunningBacks(),
          wideReceivers: store.selectedWideReceivers(),
          tightEnds: store.selectedTightEnds(),
          defenses: store.selectedDefenses(),
        };

        playerPoolsService
          .savePlayerPools(currentSlate, playerPools)
          .pipe(
            tap(() => {
              _matSnackBar.open(
                `Saved player pools for ${currentSlate
                  .replace('_', ' ')
                  .toLowerCase()} slate`,
                'Close'
              );
            }),
            catchError((error) => {
              console.error(
                `Failed to save player pools for ${currentSlate} slate:`,
                error
              );
              _matSnackBar.open('Failed to save player pools', 'Close');
              return of(null);
            })
          )
          .subscribe();
      },
    })
  )
);
