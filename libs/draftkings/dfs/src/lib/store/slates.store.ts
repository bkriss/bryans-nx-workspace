// import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  // withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { Slate } from '../enums';

/**
 * State interface for player pools
 */
export interface SlatesState {
  currentSlate: Slate;
  entries: Record<Slate, string>;
  salaries: Record<Slate, string>;
}

/**
 * Initial state for slates
 */
const initialState: SlatesState = {
  currentSlate: Slate.MAIN,
  entries: {
    [Slate.MAIN]: '',
    [Slate.EARLY_ONLY]: '',
    [Slate.SUN_TO_MON]: '',
  },
  salaries: {
    [Slate.MAIN]: '',
    [Slate.EARLY_ONLY]: '',
    [Slate.SUN_TO_MON]: '',
  },
};

export const SlatesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store) => ({
    /**
     * Sets the main slate salaries
     * @param salaries - DKSalaries.csv content for Main Slate as a string
     */
    setMainSlateSalaries(salaries: string): void {
      patchState(store, {
        salaries: { ...store.salaries(), [Slate.MAIN]: salaries },
      });
    },
    /**
     * Sets the early only slate salaries
     * @param salaries - DKSalaries.csv content for Early Only Slate as a string
     */
    setEarlyOnlySlateSalaries(salaries: string): void {
      patchState(store, {
        salaries: { ...store.salaries(), [Slate.EARLY_ONLY]: salaries },
      });
    },

    /**
     * Sets the Sun-Mon slate salaries
     * @param salaries - DKSalaries.csv content for Sun-Mon Slate as a string
     */
    setSunToMonSlateSalaries(salaries: string): void {
      patchState(store, {
        salaries: { ...store.salaries(), [Slate.SUN_TO_MON]: salaries },
      });
    },

    /**
     * Sets the main slate entries
     * @param entries - DKEntries.csv content for Main Slate as a string
     */
    setMainSlateEntries(entries: string): void {
      patchState(store, {
        entries: { ...store.entries(), [Slate.MAIN]: entries },
      });
    },

    /**
     * Sets the early only slate entries
     * @param entries - DKEntries.csv content for Early Only Slate as a string
     */
    setEarlyOnlySlateEntries(entries: string): void {
      patchState(store, {
        entries: { ...store.entries(), [Slate.EARLY_ONLY]: entries },
      });
    },

    /**
     * Sets the Sun-Mon slate entries
     * @param entries - DKEntries.csv content for Sun-Mon Slate as a string
     */
    setSunMonSlateEntries(entries: string): void {
      patchState(store, {
        entries: { ...store.entries(), [Slate.SUN_TO_MON]: entries },
      });
    },

    /**
     * Clears all slates
     */
    clearAllSlates(): void {
      patchState(store, initialState);
    },
  }))
);
