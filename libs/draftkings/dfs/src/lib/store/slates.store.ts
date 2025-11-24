import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { Slate } from '../enums';
import { SlateData, SlatesService } from './slates.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { PassCatcher, Player, Quarterback, RunningBack } from '../models';
import { getAvailablePlayers } from '../utils';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * State interface for contest slates
 */
export interface SlatesState {
  availableQuarterbacks: Quarterback[];
  availableRunningBacks: RunningBack[];
  availableWideReceivers: PassCatcher[];
  availableTightEnds: PassCatcher[];
  availableDefenses: Player[];
  currentSlate: Slate;
  entries: Record<Slate, string>;
  error: string | null;
  id: string; // Firestore document ID is required since SlatesData has to be stored in a collection
  isLoading: boolean;
  isSaving: boolean;
  salaries: Record<Slate, string>;
}

/**
 * Initial state for slates
 */
const initialState: SlatesState = {
  availableQuarterbacks: [],
  availableRunningBacks: [],
  availableWideReceivers: [],
  availableTightEnds: [],
  availableDefenses: [],
  currentSlate: Slate.MAIN,
  entries: {
    [Slate.EARLY_ONLY]: '',
    [Slate.MAIN]: '',
    [Slate.SUN_TO_MON]: '',
    [Slate.THUR_TO_MON]: '',
  },
  error: null,
  id: '',
  isLoading: false,
  isSaving: false,
  salaries: {
    [Slate.EARLY_ONLY]: '',
    [Slate.MAIN]: '',
    [Slate.SUN_TO_MON]: '',
    [Slate.THUR_TO_MON]: '',
  },
};

export const SlatesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    entriesForCurrentSlate: computed(
      () => store.entries()[store.currentSlate()]
    ),
    salariesForCurrentSlate: computed(
      () => store.salaries()[store.currentSlate()]
    ),
  })),
  withMethods(
    (
      store,
      _matSnackBar = inject(MatSnackBar),
      slatesService = inject(SlatesService)
    ) => ({
      async loadSlates() {
        patchState(store, { isLoading: true, error: null });
        slatesService
          .getSlateData()
          .pipe(
            tap({
              next: (slateData) => {
                const { entries, id, currentSlate, salaries } = slateData[0];

                const salariesForCurrentSlate = salaries[currentSlate];

                const { qbs, rbs, wrs, tes, dsts } = getAvailablePlayers(
                  30,
                  salariesForCurrentSlate
                );

                patchState(store, {
                  availableQuarterbacks: qbs,
                  availableRunningBacks: rbs,
                  availableWideReceivers: wrs,
                  availableTightEnds: tes,
                  availableDefenses: dsts,
                  id,
                  currentSlate,
                  entries,
                  isLoading: false,
                  salaries,
                });
              },
              error: (err) => {
                console.error('Failed to load slate data:', err);
                patchState(store, {
                  error: 'Failed to load slate data.',
                  isLoading: false,
                });
              },
            })
          )
          .subscribe();
      },

      async updateSlateData(updates: Partial<SlateData>) {
        patchState(store, { isSaving: true, error: null });
        const slateData: SlateData = {} as SlateData;

        if (updates.salaries) {
          slateData['salaries'] = {
            ...store.salaries(),
            ...updates.salaries,
          };
        }

        if (updates.entries) {
          slateData['entries'] = {
            ...store.entries(),
            ...updates.entries,
          };
        }

        if (updates.currentSlate) {
          slateData['currentSlate'] = updates.currentSlate;
        }

        slatesService
          .updateSlate(store.id(), slateData)
          .pipe(
            tap(() => {
              // _matSnackBar.open('Upload saved successfully', 'Close');

              // const successMessage = updates.currentSlate
              //   ? 'Current slate saved successfully'
              //   : 'Upload saved successfully';
              // _matSnackBar.open(successMessage, 'Close');

              if (!updates.currentSlate) {
                _matSnackBar.open('Upload saved successfully', 'Close');
              }

              patchState(store, () => ({
                ...slateData,
                isSaving: false,
              }));
            }),
            catchError((err) => {
              const errorMessage = updates.currentSlate
                ? 'Failed to update current slate.'
                : 'Failed to upload file.';
              _matSnackBar.open(errorMessage, 'Close');

              console.error(errorMessage, err);
              patchState(store, {
                error: errorMessage,
                isSaving: false,
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          )
          .subscribe();
      },

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
    })
  )
);
