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
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

import { getAvailablePlayers } from '../../utils';
import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  // TightEnd,
  // WideReceiver,
} from '../../models';
import { Router } from '@angular/router';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';
import { SortPassCatcherPoolComponentComponent } from '../sort-pass-catcher-pool/sort-pass-catcher-pool.component';
import { Position } from '../../enums';
// import {
//   selectedDSTs,
//   selectedQuarterbacks,
//   selectedRunningBacks,
//   selectedTightEnds,
//   selectedWideReceivers,
// } from '../../utils/early-only/selected-players.util';
import {
  selectedQuarterbacks,
  selectedRunningBacks,
  selectedWideReceivers,
  selectedTightEnds,
  selectedDSTs,
} from '../../utils/main-slate/selected-players.util';

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
  templateUrl: './dfs.component.html',
  styleUrl: './dfs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DfsComponent implements OnInit {
  private router = inject(Router);
  availableQuarterbacks: WritableSignal<Quarterback[]> = signal([]);
  availableRunningBacks: RunningBack[] = [];
  availableWideReceivers: PassCatcher[] = [];
  availableTightEnds: PassCatcher[] = [];
  availableDsts: Player[] = [];
  position = Position;

  protected playerPool = [];
  private _formBuilder = inject(FormBuilder);

  qbSelectionFormGroup = this._formBuilder.group({
    qbPoolCtrl: [
      [...selectedQuarterbacks] as Quarterback[],
      // [Validators.minLength(4), Validators.maxLength(5)],
      [Validators.minLength(0), Validators.maxLength(6)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      [...selectedRunningBacks] as RunningBack[],
      // [Validators.minLength(7), Validators.maxLength(9)],
      [Validators.minLength(0), Validators.maxLength(9)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      [...selectedWideReceivers] as PassCatcher[],
      // [Validators.minLength(30), Validators.maxLength(40)],
      [Validators.minLength(0), Validators.maxLength(40)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      [...selectedTightEnds] as PassCatcher[],
      // [Validators.minLength(4), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      [...selectedDSTs] as Player[],
      // [Validators.minLength(5), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });

  ngOnInit(): void {
    const { qbs, rbs, wrs, tes, dsts } = getAvailablePlayers(30);
    this.availableQuarterbacks.set(qbs);
    this.availableRunningBacks = rbs;
    this.availableWideReceivers = wrs;
    this.availableTightEnds = tes;
    this.availableDsts = dsts;
  }

  saveQbSelections() {
    const selectedQbs =
      this.qbSelectionFormGroup.controls.qbPoolCtrl.value || [];

    const availableQuarterbacks = this.availableQuarterbacks().map((qb) => {
      const playerIsSelected = selectedQbs.some(
        (selectedQb) => selectedQb.id === qb.id
      );
      return {
        ...qb,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Save this to DB
    console.log('availableQuarterbacksss', availableQuarterbacks);
  }

  saveRBSelections() {
    const selectedRBs =
      this.rbSelectionFormGroup.controls.rbPoolCtrl.value || [];

    const availableRunningBacks = this.availableRunningBacks.map((rb) => {
      const playerIsSelected = selectedRBs.some(
        (selectedRB) => selectedRB.id === rb.id
      );
      return {
        ...rb,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Save this to DB
    console.log('saving availableRunningBacks', availableRunningBacks);
  }

  saveWRSelections() {
    const selectedWRs =
      this.wrSelectionFormGroup.controls.wrPoolCtrl.value || [];

    const availableWideReceivers = this.availableWideReceivers.map((wr) => {
      const playerIsSelected = selectedWRs.some(
        (selectedWR) => selectedWR.id === wr.id
      );
      return {
        ...wr,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Save this to DB
    console.log('saving availableWideReceivers', availableWideReceivers);
  }

  saveTightEndSelections() {
    const selectedTEs =
      this.teSelectionFormGroup.controls.tePoolCtrl.value || [];

    const availableTightEnds = this.availableTightEnds.map((te) => {
      const playerIsSelected = selectedTEs.some(
        (selectedTE) => selectedTE.id === te.id
      );
      return {
        ...te,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Save this to DB
    console.log('saving availableTightEnds', availableTightEnds);
  }

  saveDSTSelections() {
    const selectedDSTs =
      this.teSelectionFormGroup.controls.tePoolCtrl.value || [];

    const availableDsts = this.availableDsts.map((dst) => {
      const playerIsSelected = selectedDSTs.some(
        (selectedDST) => selectedDST.id === dst.id
      );
      return {
        ...dst,
        isSelectedForPlayerPool: playerIsSelected,
      };
    });

    // TODO: Save this to DB
    console.log('saving availableDsts', availableDsts);
  }

  generateLineupBuilders() {
    // Implement your lineup generation logic here

    // TODO: Save selections to state and navigate to lineup builders page
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
