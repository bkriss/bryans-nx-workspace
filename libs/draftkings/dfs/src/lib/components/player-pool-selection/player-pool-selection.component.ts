import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
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

import { getAvailablePlayers, defaultPlayerRankings } from '../../utils';
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
export class PlayerPoolSelectionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly playerPoolsStore = inject(PlayerPoolsStore);
  private readonly slatesStore = inject(SlatesStore);

  availableQuarterbacks: WritableSignal<Quarterback[]> = signal([]);
  availableRunningBacks: WritableSignal<RunningBack[]> = signal([]);
  availableWideReceivers: WritableSignal<PassCatcher[]> = signal([]);
  availableTightEnds: WritableSignal<PassCatcher[]> = signal([]);
  availableDsts: WritableSignal<Player[]> = signal([]);
  position = Position;

  protected playerPool = [];

  qbSelectionFormGroup = this._formBuilder.group({
    qbPoolCtrl: [
      this.playerPoolsStore.quarterbacks() as Quarterback[],
      // [Validators.minLength(4), Validators.maxLength(5)],
      [Validators.minLength(0), Validators.maxLength(6)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      this.playerPoolsStore.runningBacks() as RunningBack[],
      // [Validators.minLength(7), Validators.maxLength(9)],
      [Validators.minLength(0), Validators.maxLength(9)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      this.playerPoolsStore.wideReceivers() as PassCatcher[],
      // [Validators.minLength(30), Validators.maxLength(40)],
      [Validators.minLength(0), Validators.maxLength(40)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      this.playerPoolsStore.tightEnds() as PassCatcher[],
      // [Validators.minLength(4), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      this.playerPoolsStore.defenses() as Player[],
      // [Validators.minLength(5), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });

  ngOnInit(): void {
    const salaries = this.findAppropriateSalariesFiles();
    const { qbs, rbs, wrs, tes, dsts } = getAvailablePlayers(30, salaries);
    this.availableQuarterbacks.set(qbs);
    this.availableRunningBacks.set(rbs);
    this.availableWideReceivers.set(wrs);
    this.availableTightEnds.set(tes);
    this.availableDsts.set(dsts);

    this.getDefaultPlayerRankings();
  }

  findAppropriateSalariesFiles(): string {
    const currentSlate = this.slatesStore.currentSlate();

    if (currentSlate === Slate.MAIN) {
      return this.slatesStore.salaries()[Slate.MAIN];
    } else if (currentSlate === Slate.EARLY_ONLY) {
      return this.slatesStore.salaries()[Slate.EARLY_ONLY];
    } else if (currentSlate === Slate.SUN_TO_MON) {
      return this.slatesStore.salaries()[Slate.SUN_TO_MON];
    } else {
      return '';
    }
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
    const selectedQbs =
      this.qbSelectionFormGroup.controls.qbPoolCtrl.value || [];

    // TODO: Refactor this to use a service from NgRx Signal Store to save Quarterback selections to Firebase Firestore
    this.playerPoolsStore.setQuarterbacks(selectedQbs);

    const availableQuarterbacks = this.availableQuarterbacks().map((qb) => {
      const playerIsSelected = selectedQbs.some(
        (selectedQb) => selectedQb.id === qb.id
      );
      return {
        ...qb,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Use service from NgRx Signal Store to save Quarterback selections to Firebase Firestore
    console.log('availableQuarterbacks', availableQuarterbacks);
  }

  saveRBSelections() {
    const selectedRBs =
      this.rbSelectionFormGroup.controls.rbPoolCtrl.value || [];

    // TODO: Refactor this to use a service from NgRx Signal Store to save Running Back selections to Firebase Firestore
    this.playerPoolsStore.setRunningBacks(selectedRBs);

    const availableRunningBacks = this.availableRunningBacks().map((rb) => {
      const playerIsSelected = selectedRBs.some(
        (selectedRB) => selectedRB.id === rb.id
      );
      return {
        ...rb,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Use service from NgRx Signal Store to save Running Back selections to Firebase Firestore
    console.log('saving availableRunningBacks', availableRunningBacks);
  }

  saveWRSelections() {
    const selectedWRs =
      this.wrSelectionFormGroup.controls.wrPoolCtrl.value || [];

    // TODO: Refactor this to use a service from NgRx Signal Store to save Wide Receiver selections to Firebase Firestore
    this.playerPoolsStore.setWideReceivers(selectedWRs);

    const availableWideReceivers = this.availableWideReceivers().map((wr) => {
      const playerIsSelected = selectedWRs.some(
        (selectedWR) => selectedWR.id === wr.id
      );
      return {
        ...wr,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Use service from NgRx Signal Store to save Wide Receiver selections to Firebase Firestore
    console.log('saving availableWideReceivers', availableWideReceivers);
  }

  saveTightEndSelections() {
    const selectedTEs =
      this.teSelectionFormGroup.controls.tePoolCtrl.value || [];

    // TODO: Refactor this to use a service from NgRx Signal Store to save Tight End selections to Firebase Firestore
    this.playerPoolsStore.setTightEnds(selectedTEs);

    const availableTightEnds = this.availableTightEnds().map((te) => {
      const playerIsSelected = selectedTEs.some(
        (selectedTE) => selectedTE.id === te.id
      );
      return {
        ...te,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Use service from NgRx Signal Store to save Tight End selections to Firebase Firestore
    console.log('saving availableTightEnds', availableTightEnds);
  }

  saveDSTSelections() {
    const selectedDSTs =
      this.dstSelectionFormGroup.controls.dstPoolCtrl.value || [];

    // TODO: Refactor this to use a service from NgRx Signal Store to save Defense selections to Firebase Firestore
    this.playerPoolsStore.setDefenses(selectedDSTs);

    const availableDsts = this.availableDsts().map((dst) => {
      const playerIsSelected = selectedDSTs.some(
        (selectedDST) => selectedDST.id === dst.id
      );
      return {
        ...dst,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Use service from NgRx Signal Store to save DST selections to Firebase Firestore
    console.log('saving availableDsts', availableDsts);
  }

  generateLineupBuilders() {
    this.router.navigate(['/dfs/lineup-builders']);
  }

  updateQuarterbacks(newQuarterbacks: Quarterback[]) {
    this.qbSelectionFormGroup.controls.qbPoolCtrl.setValue(newQuarterbacks);
  }

  updateRunningBacks(newRunningBacks: RunningBack[]) {
    this.rbSelectionFormGroup.controls.rbPoolCtrl.setValue(newRunningBacks);
  }

  updateWideReceivers(newWideReceivers: PassCatcher[]) {
    this.wrSelectionFormGroup.controls.wrPoolCtrl.setValue(newWideReceivers);
  }

  updateTightEnds(newTightEnds: PassCatcher[]) {
    this.teSelectionFormGroup.controls.tePoolCtrl.setValue(newTightEnds);
  }

  updateDsts(newDsts: Player[]) {
    this.dstSelectionFormGroup.controls.dstPoolCtrl.setValue(newDsts);
  }
}
