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
import { Subscription } from 'rxjs';

import { defaultPlayerRankings } from '../../utils';
import { PassCatcher, Player, Quarterback, RunningBack } from '../../models';
import { Router } from '@angular/router';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';
import { SortPassCatcherPoolComponentComponent } from '../sort-pass-catcher-pool/sort-pass-catcher-pool.component';
import { Position, Slate } from '../../enums';
import { PlayerPoolsStore, SlatesStore } from '../../store';

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
      [Validators.minLength(0), Validators.maxLength(6)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      this.selectedRunningBacks() as RunningBack[],
      // [Validators.minLength(7), Validators.maxLength(9)],
      [Validators.minLength(0), Validators.maxLength(9)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      this.selectedWideReceivers() as PassCatcher[],
      // [Validators.minLength(30), Validators.maxLength(40)],
      [Validators.minLength(0), Validators.maxLength(40)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      this.selectedTightEnds() as PassCatcher[],
      // [Validators.minLength(4), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      this.selectedDefenses() as Player[],
      // [Validators.minLength(5), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
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
    this.getDefaultPlayerRankings();
  }

  // TODO: Remove ngOnDestroy and refactor once Signal Forms is stable
  ngOnDestroy() {
    this.qbChangesSubscription.unsubscribe();
    this.rbChangesSubscription.unsubscribe();
    this.wrChangesSubscription.unsubscribe();
    this.teChangesSubscription.unsubscribe();
    this.dstChangesSubscription.unsubscribe();
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

  getDefaultPlayerRankings() {
    // const espn_s2 = 'AECtee1R4lXe%2F8iKxzRObuXWZV6ttEtbV4I9ga%2BzS%2FfIhoiodf%2BofCCofToAthJ4fZ4MkM6i3rbPlRNQ%2FORvd1qzD3CPppe9fA%2FO0BfdYwaEc3JIpDXvUlvf7n0j%2BMBBAxKJDxLlFkKsqdaR8c48DULYo8DZFtaKe7XHR7eE1%2Boeq%2FyUcLwgtD%2F4KowBILBxjdYaPvxXpGCHPTikuemtgiDypyMrMlIBfseRWcRDjq920ZXSdW1nbmUkCnUw%2B04u9TBUZ37lRGPJIqSti21tk2R%2FzVmzRk9OEKH79fP6dD0RAg%3D%3D';
    // const SWID = '{F9A0366F-B19B-4481-AA52-06D9FC8634CA}';
    // const params = {
    //   season: '2025',
    //   scoringPeriodId: 11,
    //   leagueId: 648971614,
    // };
    const defaultQbRankings = defaultPlayerRankings(
      Position.QB,
      Slate.SUN_TO_MON
    );
    const defaultRBRankings = defaultPlayerRankings(
      Position.RB,
      Slate.SUN_TO_MON
    );
    const defaultWRRankings = defaultPlayerRankings(
      Position.WR,
      Slate.SUN_TO_MON
    );
    const defaultTERankings = defaultPlayerRankings(
      Position.TE,
      Slate.SUN_TO_MON
    );
    const defaultDSTRankings = defaultPlayerRankings(
      Position.DST,
      Slate.SUN_TO_MON
    );
    console.log('defaultQbRankings', defaultQbRankings);
    console.log('defaultRBRankings', defaultRBRankings);
    console.log('defaultWRRankings', defaultWRRankings);
    console.log('defaultTERankings', defaultTERankings);
    console.log('defaultDSTRankings', defaultDSTRankings);
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

  // updateQuarterbacks(newQuarterbacks: Quarterback[]) {
  //   this.qbSelectionFormGroup.controls.qbPoolCtrl.setValue(newQuarterbacks);
  // }

  // updateRunningBacks(newRunningBacks: RunningBack[]) {
  //   this.rbSelectionFormGroup.controls.rbPoolCtrl.setValue(newRunningBacks);
  // }

  // updateWideReceivers(newWideReceivers: PassCatcher[]) {
  //   this.wrSelectionFormGroup.controls.wrPoolCtrl.setValue(newWideReceivers);
  // }

  // updateTightEnds(newTightEnds: PassCatcher[]) {
  //   this.teSelectionFormGroup.controls.tePoolCtrl.setValue(newTightEnds);
  // }

  // updateDsts(newDsts: Player[]) {
  //   this.dstSelectionFormGroup.controls.dstPoolCtrl.setValue(newDsts);
  // }
}
