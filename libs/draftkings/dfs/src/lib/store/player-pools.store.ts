import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
} from '../models/player.model';
import { Position } from '../enums';

/**
 * State interface for player pools
 */
export interface PlayerPoolsState {
  quarterbacks: Quarterback[];
  runningBacks: RunningBack[];
  wideReceivers: PassCatcher[];
  tightEnds: PassCatcher[];
  defenses: Player[];
}

/**
 * Initial state for player pools
 */
const initialState: PlayerPoolsState = {
  quarterbacks: [],
  runningBacks: [],
  wideReceivers: [],
  tightEnds: [],
  defenses: [],
};

export const PlayerPoolsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    /**
     * Total number of quarterbacks in the pool
     */
    qbCount: computed(() => store.quarterbacks().length),

    /**
     * Total number of running backs in the pool
     */
    rbCount: computed(() => store.runningBacks().length),

    /**
     * Total number of wide receivers in the pool
     */
    wrCount: computed(() => store.wideReceivers().length),

    /**
     * Total number of tight ends in the pool
     */
    teCount: computed(() => store.tightEnds().length),

    /**
     * Total number of defenses in the pool
     */
    dstCount: computed(() => store.defenses().length),

    /**
     * Indicates whether all required player pools have been populated
     */
    allPoolsAreSet: computed(
      () =>
        store.quarterbacks().length > 0 &&
        store.runningBacks().length > 0 &&
        store.wideReceivers().length > 0 &&
        store.tightEnds().length > 0 &&
        store.defenses().length > 0
    ),

    /**
     * Total number of players across all pools
     */
    totalPlayerCount: computed(
      () =>
        store.quarterbacks().length +
        store.runningBacks().length +
        store.wideReceivers().length +
        store.tightEnds().length +
        store.defenses().length
    ),
  })),

  withMethods((store) => ({
    /**
     * Sets the quarterback pool
     * @param quarterbacks - Array of quarterbacks to set in the pool
     */
    setQuarterbacks(quarterbacks: Quarterback[]): void {
      patchState(store, { quarterbacks: [...quarterbacks] });
    },

    /**
     * Sets the running back pool
     * @param runningBacks - Array of running backs to set in the pool
     */
    setRunningBacks(runningBacks: RunningBack[]): void {
      patchState(store, { runningBacks: [...runningBacks] });
    },

    /**
     * Sets the wide receiver pool
     * @param wideReceivers - Array of wide receivers to set in the pool
     */
    setWideReceivers(wideReceivers: PassCatcher[]): void {
      patchState(store, { wideReceivers: [...wideReceivers] });
    },

    /**
     * Sets the tight end pool
     * @param tightEnds - Array of tight ends to set in the pool
     */
    setTightEnds(tightEnds: PassCatcher[]): void {
      patchState(store, { tightEnds: [...tightEnds] });
    },

    /**
     * Sets the defense pool
     * @param defenses - Array of defenses to set in the pool
     */
    setDefenses(defenses: Player[]): void {
      patchState(store, { defenses: [...defenses] });
    },

    /**
     * Sets all player pools at once
     * @param pools - Object containing all player pools
     */
    setAllPools(pools: Partial<PlayerPoolsState>): void {
      patchState(store, {
        quarterbacks: pools.quarterbacks
          ? [...pools.quarterbacks]
          : store.quarterbacks(),
        runningBacks: pools.runningBacks
          ? [...pools.runningBacks]
          : store.runningBacks(),
        wideReceivers: pools.wideReceivers
          ? [...pools.wideReceivers]
          : store.wideReceivers(),
        tightEnds: pools.tightEnds ? [...pools.tightEnds] : store.tightEnds(),
        defenses: pools.defenses ? [...pools.defenses] : store.defenses(),
      });
    },

    /**
     * Updates a specific quarterback in the pool
     * @param updatedQb - The quarterback with updated properties
     */
    updateQuarterback(updatedQb: Quarterback): void {
      const updatedQbs = store
        .quarterbacks()
        .map((qb) => (qb.id === updatedQb.id ? updatedQb : qb));
      patchState(store, { quarterbacks: updatedQbs });
    },

    /**
     * Updates a specific running back in the pool
     * @param updatedRb - The running back with updated properties
     */
    updateRunningBack(updatedRb: RunningBack): void {
      const updatedRbs = store
        .runningBacks()
        .map((rb) => (rb.id === updatedRb.id ? updatedRb : rb));
      patchState(store, { runningBacks: updatedRbs });
    },

    /**
     * Updates a specific wide receiver in the pool
     * @param updatedWr - The wide receiver with updated properties
     */
    updateWideReceiver(updatedWr: PassCatcher): void {
      const updatedWrs = store
        .wideReceivers()
        .map((wr) => (wr.id === updatedWr.id ? updatedWr : wr));
      patchState(store, { wideReceivers: updatedWrs });
    },

    /**
     * Updates a specific tight end in the pool
     * @param updatedTe - The tight end with updated properties
     */
    updateTightEnd(updatedTe: PassCatcher): void {
      const updatedTes = store
        .tightEnds()
        .map((te) => (te.id === updatedTe.id ? updatedTe : te));
      patchState(store, { tightEnds: updatedTes });
    },

    /**
     * Updates a specific defense in the pool
     * @param updatedDst - The defense with updated properties
     */
    updateDefense(updatedDst: Player): void {
      const updatedDsts = store
        .defenses()
        .map((dst) => (dst.id === updatedDst.id ? updatedDst : dst));
      patchState(store, { defenses: updatedDsts });
    },

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
    clearPool(position: Position): void {
      switch (position) {
        case Position.QB:
          patchState(store, { quarterbacks: [] });
          break;
        case Position.RB:
          patchState(store, { runningBacks: [] });
          break;
        case Position.WR:
          patchState(store, { wideReceivers: [] });
          break;
        case Position.TE:
          patchState(store, { tightEnds: [] });
          break;
        case Position.DST:
          patchState(store, { defenses: [] });
          break;
      }
    },
  }))
);
