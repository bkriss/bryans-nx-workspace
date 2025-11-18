import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PassCatcher, Player, Quarterback, RunningBack } from '../../models';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';
import { SortPassCatcherPoolComponentComponent } from '../sort-pass-catcher-pool/sort-pass-catcher-pool.component';
import { Position } from '../../enums';
import { PlayerPoolsStore, SlatesStore } from '../../store';
import { PlayerProjectionsStore } from '../../store/player-projections.store';
import { PlayerScoringProjection } from '../../store/player-projections.service';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    ReactiveFormsModule,
    SortPassCatcherPoolComponentComponent,
    SortPlayerPoolComponent,
  ],
  templateUrl: './player-pool-selection.component.html',
  styleUrl: './player-pool-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPoolSelectionComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly playerPoolsStore = inject(PlayerPoolsStore);
  private readonly playerProjectionsStore = inject(PlayerProjectionsStore);
  private readonly slatesStore = inject(SlatesStore);

  // TODO: Remove subscriptions and refactor once Signal Forms is stable
  private qbChangesSubscription: Subscription = new Subscription();
  private rbChangesSubscription: Subscription = new Subscription();
  private wrChangesSubscription: Subscription = new Subscription();
  private teChangesSubscription: Subscription = new Subscription();
  private dstChangesSubscription: Subscription = new Subscription();

  availableQuarterbacks = this.slatesStore.availableQuarterbacks;
  availableRunningBacks = this.slatesStore.availableRunningBacks;
  availableWideReceivers = this.slatesStore.availableWideReceivers;
  availableTightEnds = this.slatesStore.availableTightEnds;
  availableDsts = this.slatesStore.availableDefenses;
  isLoading = this.slatesStore.isLoading;
  position = Position;
  playerPoolsLoaded = signal(false);
  selectedQuarterbacks = this.playerPoolsStore.selectedQuarterbacks;
  selectedRunningBacks = this.playerPoolsStore.selectedRunningBacks;
  selectedWideReceivers = this.playerPoolsStore.selectedWideReceivers;
  selectedTightEnds = this.playerPoolsStore.selectedTightEnds;
  selectedDefenses = this.playerPoolsStore.selectedDefenses;

  qbSelectionFormGroup = this._formBuilder.group({
    qbPoolCtrl: [
      this.selectedQuarterbacks() as Quarterback[],
      // [Validators.minLength(4), Validators.maxLength(5)],
      [Validators.minLength(0), Validators.maxLength(20)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      this.selectedRunningBacks() as RunningBack[],
      // [Validators.minLength(7), Validators.maxLength(9)],
      [Validators.minLength(0), Validators.maxLength(15)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      this.selectedWideReceivers() as PassCatcher[],
      // [Validators.minLength(30), Validators.maxLength(40)],
      [Validators.minLength(0), Validators.maxLength(75)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      this.selectedTightEnds() as PassCatcher[],
      // [Validators.minLength(4), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(25)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      this.selectedDefenses() as Player[],
      // [Validators.minLength(5), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(15)],
    ],
  });

  constructor() {
    // Effect to load player pools after slates are successfully loaded
    effect(() => {
      const isLoading = this.slatesStore.isLoading();
      const currentSlate = this.slatesStore.currentSlate();

      // When loading completes and we have a valid slate, load player pools
      if (!isLoading && currentSlate && !this.playerPoolsLoaded()) {
        this.playerPoolsLoaded.set(true);
        this.playerPoolsStore.loadPlayerPoolsFromFirestore();
      }
    });

    // effect(() => {
    //
    // });

    // Effect to update form controls when player pools are loaded from Firestore
    // TODO: Potentially remove and/or refactor once Signal Forms is stable
    effect(() => {
      const qbs = this.selectedQuarterbacks();
      const rbs = this.selectedRunningBacks();
      const wrs = this.selectedWideReceivers();
      const tes = this.selectedTightEnds();
      const dsts = this.selectedDefenses();

      // Update form controls with loaded data (without emitting events to avoid circular updates)
      this.qbSelectionFormGroup.controls.qbPoolCtrl.setValue(qbs, {
        emitEvent: false,
      });
      this.rbSelectionFormGroup.controls.rbPoolCtrl.setValue(rbs, {
        emitEvent: false,
      });
      this.wrSelectionFormGroup.controls.wrPoolCtrl.setValue(wrs, {
        emitEvent: false,
      });
      this.teSelectionFormGroup.controls.tePoolCtrl.setValue(tes, {
        emitEvent: false,
      });
      this.dstSelectionFormGroup.controls.dstPoolCtrl.setValue(dsts, {
        emitEvent: false,
      });
    });
  }

  ngOnInit(): void {
    this.slatesStore.loadSlates();
    this.updateSignalsWhenFormValuesChange();
    this.playerProjectionsStore.loadPlayerScoringProjections();
  }

  // TODO: Remove ngOnDestroy and refactor once Signal Forms is stable
  ngOnDestroy() {
    this.qbChangesSubscription.unsubscribe();
    this.rbChangesSubscription.unsubscribe();
    this.wrChangesSubscription.unsubscribe();
    this.teChangesSubscription.unsubscribe();
    this.dstChangesSubscription.unsubscribe();
  }

  selectPlayersBasedOnProjections(position: Position) {
    if (position === Position.QB) {
      const selectedPlayers = this.selectMostValuablePlayers(
        this.availableQuarterbacks(),
        this.playerProjectionsStore.quarterbacks(),
        20
      );
      this.playerPoolsStore.setQuarterbacks(selectedPlayers as Quarterback[]);
    } else if (position === Position.RB) {
      const selectedPlayers = this.selectMostValuablePlayers(
        this.availableRunningBacks(),
        this.playerProjectionsStore.runningBacks(),
        15
      );
      this.playerPoolsStore.setRunningBacks(selectedPlayers as RunningBack[]);
    } else if (position === Position.WR) {
      const selectedPlayers = this.selectMostValuablePlayers(
        this.availableWideReceivers(),
        this.playerProjectionsStore.wideReceivers(),
        50
      );
      this.playerPoolsStore.setWideReceivers(selectedPlayers as PassCatcher[]);
    } else if (position === Position.TE) {
      const selectedPlayers = this.selectMostValuablePlayers(
        this.availableTightEnds(),
        this.playerProjectionsStore.tightEnds(),
        25
      );
      this.playerPoolsStore.setTightEnds(selectedPlayers as PassCatcher[]);
    } else if (position === Position.DST) {
      const selectedPlayers = this.selectMostValuablePlayers(
        this.availableDsts(),
        this.playerProjectionsStore.dsts(),
        15
      );
      this.playerPoolsStore.setDefenses(selectedPlayers as Player[]);
    }
  }

  // TODO: Refactor app so projectedPointsPerDollar is added right away.
  selectMostValuablePlayers(
    dkPlayers: Player[],
    playersWithProjections: PlayerScoringProjection[],
    numberOfPlayersToReturn: number
  ) {
    const selectedPlayers = playersWithProjections
      .map((espnPlayer) => {
        const player = dkPlayers.find(
          (dkPlayer) =>
            dkPlayer.teamAbbrev === espnPlayer.teamAbbrev &&
            espnPlayer.fullName.includes(dkPlayer.name)
        );

        if (!player) {
          console.warn(
            `Couldn't find DK match for: ${espnPlayer.fullName} (${espnPlayer.teamAbbrev})`
          );
        }
        return player
          ? {
              ...player,
              projectedPointsPerDollar: Number(
                ((espnPlayer.projectedPoints / player.salary) * 100).toFixed(4)
              ),
            }
          : null;
      })
      .filter((espnPlayer) => espnPlayer !== null)
      .sort((a, b) => b.projectedPointsPerDollar - a.projectedPointsPerDollar)
      .slice(0, numberOfPlayersToReturn);

    return selectedPlayers;
  }

  // TODO: Remove updateSignalsWhenFormValuesChange and refactor once Signal Forms is stable
  updateSignalsWhenFormValuesChange() {
    this.qbChangesSubscription =
      this.qbSelectionFormGroup.controls.qbPoolCtrl.valueChanges.subscribe(
        (selectedQbs) => {
          this.playerPoolsStore.setQuarterbacks(selectedQbs || []);
        }
      );
    this.rbChangesSubscription =
      this.rbSelectionFormGroup.controls.rbPoolCtrl.valueChanges.subscribe(
        (selectedRBs) => {
          this.playerPoolsStore.setRunningBacks(selectedRBs || []);
        }
      );
    this.wrChangesSubscription =
      this.wrSelectionFormGroup.controls.wrPoolCtrl.valueChanges.subscribe(
        (selectedWRs) => {
          this.playerPoolsStore.setWideReceivers(selectedWRs || []);
        }
      );
    this.teChangesSubscription =
      this.teSelectionFormGroup.controls.tePoolCtrl.valueChanges.subscribe(
        (selectedTEs) => {
          this.playerPoolsStore.setTightEnds(selectedTEs || []);
        }
      );
    this.dstChangesSubscription =
      this.dstSelectionFormGroup.controls.dstPoolCtrl.valueChanges.subscribe(
        (selectedDSTs) => {
          this.playerPoolsStore.setDefenses(selectedDSTs || []);
        }
      );
  }

  saveQbSelections() {
    console.log('saveQbSelections');
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  saveRBSelections() {
    console.log('saveRBSelections');
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  saveWRSelections() {
    console.log('saveWRSelections');
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  saveTightEndSelections() {
    console.log('saveTESelections');
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  saveDSTSelections() {
    console.log('saveDSTSelections');
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  generateLineupBuilders() {
    this.router.navigate(['/dfs/lineup-builders']);
  }
}
