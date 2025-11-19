import { computed, inject } from '@angular/core';
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
import { PlayerProjectionsService } from './player-projections.service';

/**
 * State interface for player pools
 */
export interface PlayerPoolsState {
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
    /**
     * Total number of quarterbacks in the pool
     */
    qbCount: computed(() => store.selectedQuarterbacks().length),

    /**
     * Total number of running backs in the pool
     */
    rbCount: computed(() => store.selectedRunningBacks().length),

    /**
     * Total number of wide receivers in the pool
     */
    wrCount: computed(() => store.selectedWideReceivers().length),

    /**
     * Total number of tight ends in the pool
     */
    teCount: computed(() => store.selectedTightEnds().length),

    /**
     * Total number of defenses in the pool
     */
    dstCount: computed(() => store.selectedDefenses().length),

    /**
     * Indicates whether all required player pools have been populated
     */
    allPoolsAreSet: computed(
      () =>
        store.selectedQuarterbacks().length > 0 &&
        store.selectedRunningBacks().length > 0 &&
        store.selectedWideReceivers().length > 0 &&
        store.selectedTightEnds().length > 0 &&
        store.selectedDefenses().length > 0
    ),

    /**
     * Total number of players across all pools
     */
    totalPlayerCount: computed(
      () =>
        store.selectedQuarterbacks().length +
        store.selectedRunningBacks().length +
        store.selectedWideReceivers().length +
        store.selectedTightEnds().length +
        store.selectedDefenses().length
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
    /**
     * Sets the quarterback pool
     * @param quarterbacks - Array of quarterbacks to set in the pool
     */
    setQuarterbacks(quarterbacks: Quarterback[]): void {
      patchState(store, { selectedQuarterbacks: [...quarterbacks] });
    },

    /**
     * Sets the running back pool
     * @param runningBacks - Array of running backs to set in the pool
     */
    setRunningBacks(runningBacks: RunningBack[]): void {
      patchState(store, { selectedRunningBacks: [...runningBacks] });
    },

    /**
     * Sets the wide receiver pool
     * @param wideReceivers - Array of wide receivers to set in the pool
     */
    setWideReceivers(wideReceivers: PassCatcher[]): void {
      patchState(store, { selectedWideReceivers: [...wideReceivers] });
    },

    /**
     * Sets the tight end pool
     * @param tightEnds - Array of tight ends to set in the pool
     */
    setTightEnds(tightEnds: PassCatcher[]): void {
      patchState(store, { selectedTightEnds: [...tightEnds] });
    },

    /**
     * Sets the defense pool
     * @param defenses - Array of defenses to set in the pool
     */
    setDefenses(defenses: Player[]): void {
      patchState(store, { selectedDefenses: [...defenses] });
    },

    /**
     * Sets all player pools at once
     * @param pools - Object containing all player pools
     */
    // setAllPools(pools: Partial<PlayerPoolsState>): void {
    //   patchState(store, {
    //     quarterbacks: pools.quarterbacks
    //       ? [...pools.quarterbacks]
    //       : store.quarterbacks(),
    //     runningBacks: pools.runningBacks
    //       ? [...pools.runningBacks]
    //       : store.runningBacks(),
    //     wideReceivers: pools.wideReceivers
    //       ? [...pools.wideReceivers]
    //       : store.wideReceivers(),
    //     tightEnds: pools.tightEnds ? [...pools.tightEnds] : store.tightEnds(),
    //     defenses: pools.defenses ? [...pools.defenses] : store.defenses(),
    //   });
    // },

    /**
     * Updates a specific quarterback in the pool
     * @param updatedQb - The quarterback with updated properties
     */
    // updateQuarterback(updatedQb: Quarterback): void {
    //   const updatedQbs = store
    //     .quarterbacks()
    //     .map((qb) => (qb.id === updatedQb.id ? updatedQb : qb));
    //   patchState(store, { quarterbacks: updatedQbs });
    // },

    /**
     * Updates a specific running back in the pool
     * @param updatedRb - The running back with updated properties
     */
    // updateRunningBack(updatedRb: RunningBack): void {
    //   const updatedRbs = store
    //     .runningBacks()
    //     .map((rb) => (rb.id === updatedRb.id ? updatedRb : rb));
    //   patchState(store, { runningBacks: updatedRbs });
    // },

    /**
     * Updates a specific wide receiver in the pool
     * @param updatedWr - The wide receiver with updated properties
     */
    // updateWideReceiver(updatedWr: PassCatcher): void {
    //   const updatedWrs = store
    //     .wideReceivers()
    //     .map((wr) => (wr.id === updatedWr.id ? updatedWr : wr));
    //   patchState(store, { wideReceivers: updatedWrs });
    // },

    /**
     * Updates a specific tight end in the pool
     * @param updatedTe - The tight end with updated properties
     */
    // updateTightEnd(updatedTe: PassCatcher): void {
    //   const updatedTes = store
    //     .tightEnds()
    //     .map((te) => (te.id === updatedTe.id ? updatedTe : te));
    //   patchState(store, { tightEnds: updatedTes });
    // },

    /**
     * Updates a specific defense in the pool
     * @param updatedDst - The defense with updated properties
     */
    // updateDefense(updatedDst: Player): void {
    //   const updatedDsts = store
    //     .defenses()
    //     .map((dst) => (dst.id === updatedDst.id ? updatedDst : dst));
    //   patchState(store, { defenses: updatedDsts });
    // },

    /**
     * Clears all player pools
     */
    clearAllPools(): void {
      patchState(store, initialState);
    },

    /**
     * Clears a specific position pool
     * @param position - The position to clear ('QB', 'RB', 'WR', 'TE', 'DST')
     */
    // clearPool(position: Position): void {
    //   switch (position) {
    //     case Position.QB:
    //       patchState(store, { quarterbacks: [] });
    //       break;
    //     case Position.RB:
    //       patchState(store, { runningBacks: [] });
    //       break;
    //     case Position.WR:
    //       patchState(store, { wideReceivers: [] });
    //       break;
    //     case Position.TE:
    //       patchState(store, { tightEnds: [] });
    //       break;
    //     case Position.DST:
    //       patchState(store, { defenses: [] });
    //       break;
    //   }
    // },
  })),

  withMethods(
    (
      store,
      playerPoolsService = inject(PlayerPoolsService),
      slatesStore = inject(SlatesStore),
      playerProjectionsService = inject(PlayerProjectionsService)
    ) => ({
      /**
       * Loads player pools from Firestore based on the current slate
       * Uses the currentSlate from SlatesStore to determine which collection to fetch from
       */
      loadPlayerPoolsFromFirestore(): void {
        const currentSlate = slatesStore.currentSlate();

        playerPoolsService
          .getPlayerPools(currentSlate)
          .pipe(
            tap((playerPools) => {
              if (playerPools) {
                patchState(store, {
                  selectedQuarterbacks: playerPools.quarterbacks || [],
                  selectedRunningBacks: playerPools.runningBacks || [],
                  selectedWideReceivers: playerPools.wideReceivers || [],
                  selectedTightEnds: playerPools.tightEnds || [],
                  selectedDefenses: playerPools.defenses || [],
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
              return of(null);
            })
          )
          .subscribe();
      },

      /**
       * Saves the current player pools to Firestore based on the current slate
       * Uses the currentSlate from SlatesStore to determine which collection to update
       */
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
              console.log(
                `Successfully saved player pools to Firestore for ${currentSlate} slate`
              );
            }),
            catchError((error) => {
              console.error(
                `Failed to save player pools for ${currentSlate} slate:`,
                error
              );
              return of(null);
            })
          )
          .subscribe();
      },
    })
  )
);
