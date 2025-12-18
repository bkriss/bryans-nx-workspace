import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { catchError, finalize, of, tap } from 'rxjs';
import { SlatesStore } from './slates.store';
import { SimpleLineup } from '../models';
import { Lineups, LineupsService } from './lineups.service';
import { Slate } from '../enums';
// import { SlatesStore } from '../';

export interface LineupsState {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lineupsForQb1: SimpleLineup[];
  lineupsForQb2: SimpleLineup[];
  lineupsForQb3: SimpleLineup[];
  lineupsForQb4: SimpleLineup[];
  lineupsForQb5: SimpleLineup[];
  lineupsForQb6: SimpleLineup[];
}

const initialState: LineupsState = {
  error: null,
  isLoading: false,
  isSaving: false,
  lineupsForQb1: [],
  lineupsForQb2: [],
  lineupsForQb3: [],
  lineupsForQb4: [],
  lineupsForQb5: [],
  lineupsForQb6: [],
};

export const LineupsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    lineupsForAllQbs: computed(() => [
      ...store.lineupsForQb1(),
      ...store.lineupsForQb2(),
      ...store.lineupsForQb3(),
      ...store.lineupsForQb4(),
      ...store.lineupsForQb5(),
      ...store.lineupsForQb6(),
    ]),
    hasAnyLineups: computed(
      () =>
        store.lineupsForQb1().length +
          store.lineupsForQb2().length +
          store.lineupsForQb3().length +
          store.lineupsForQb4().length +
          store.lineupsForQb5().length +
          store.lineupsForQb6().length >
        0
    ),
  })),

  withMethods(
    (
      store,
      lineupsService = inject(LineupsService),
      slatesStore = inject(SlatesStore),
      _matSnackBar = inject(MatSnackBar)
    ) => ({
      loadLineupsFromFirestore(): void {
        const currentSlate: Slate = slatesStore.currentSlate();
        patchState(store, { isLoading: true, error: null });

        lineupsService
          .getLineups(currentSlate)
          .pipe(
            tap((lineups: Lineups | null) => {
              if (lineups) {
                patchState(store, {
                  lineupsForQb1: lineups.lineupsForQb1 ?? [],
                  lineupsForQb2: lineups.lineupsForQb2 ?? [],
                  lineupsForQb3: lineups.lineupsForQb3 ?? [],
                  lineupsForQb4: lineups.lineupsForQb4 ?? [],
                  lineupsForQb5: lineups.lineupsForQb5 ?? [],
                  lineupsForQb6: lineups.lineupsForQb6 ?? [],
                });
              } else {
                // No lineups saved yet for this slate; clear the store
                patchState(store, initialState);
              }
            }),
            catchError((error) => {
              console.error(
                `Failed to load lineups for ${currentSlate} slate:`,
                error
              );
              patchState(store, {
                error: 'Failed to load lineups.',
                isLoading: false,
              });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
          .subscribe();
      },

      saveLineupsToFirestore(lineupsPartial: Partial<Lineups>): void {
        const currentSlate: Slate = slatesStore.currentSlate();

        let successMessage = `Saved lineups for ${currentSlate
          .replace('_', ' ')
          .toLowerCase()} slate`;
        if (
          lineupsPartial.lineupsForQb1?.length === 0 &&
          lineupsPartial.lineupsForQb2?.length === 0 &&
          lineupsPartial.lineupsForQb3?.length === 0 &&
          lineupsPartial.lineupsForQb4?.length === 0 &&
          lineupsPartial.lineupsForQb5?.length === 0 &&
          lineupsPartial.lineupsForQb6?.length === 0
        ) {
          successMessage = `Deleted all lineups for ${currentSlate
            .replace('_', ' ')
            .toLowerCase()} slate`;
        }

        patchState(store, { isSaving: true, error: null });
        lineupsService
          .saveLineups(currentSlate, lineupsPartial)
          .pipe(
            tap(() => {
              _matSnackBar.open(successMessage, 'Close');
            }),
            catchError((error) => {
              console.error(
                `Failed to save lineups for ${currentSlate} slate:`,
                error
              );
              _matSnackBar.open('Failed to save lineups', 'Close');
              patchState(store, { error: 'Failed to save lineups.' });
              return of(null);
            }),
            finalize(() => patchState(store, { isSaving: false }))
          )
          .subscribe();
      },
      setLineupsForQb1(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb1: [...lineups] });
      },
      setLineupsForQb2(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb2: [...lineups] });
      },
      setLineupsForQb3(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb3: [...lineups] });
      },
      setLineupsForQb4(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb4: [...lineups] });
      },
      setLineupsForQb5(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb5: [...lineups] });
      },
      setLineupsForQb6(lineups: SimpleLineup[]): void {
        patchState(store, { lineupsForQb6: [...lineups] });
      },

      clearAllLineups(): void {
        patchState(store, initialState);
      },
    })
  )
);
