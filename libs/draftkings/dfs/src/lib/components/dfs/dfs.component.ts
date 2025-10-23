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
  Player,
  Quarterback,
  RunningBack,
  TightEnd,
  WideReceiver,
} from '../../models';
import { Router } from '@angular/router';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';
import { SortPassCatcherPoolComponentComponent } from '../sort-pass-catcher-pool/sort-pass-catcher-pool.component';
import { Position } from '../../enums';
import {
  selectedQuarterbacks,
  selectedRunningBacks,
} from '../../utils/selected-players.util';

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
  availableWideReceivers: WideReceiver[] = [];
  availableTightEnds: TightEnd[] = [];
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
      // [Validators.minLength(6), Validators.maxLength(8)],
      [Validators.minLength(0), Validators.maxLength(8)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      [] as WideReceiver[],
      // [Validators.minLength(18), Validators.maxLength(30)],
      [Validators.minLength(0), Validators.maxLength(30)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      [] as TightEnd[],
      // [Validators.minLength(4), Validators.maxLength(10)],
      [Validators.minLength(0), Validators.maxLength(10)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      [] as Player[],
      // [Validators.minLength(4), Validators.maxLength(7)],
      [Validators.minLength(0), Validators.maxLength(7)],
    ],
  });

  ngOnInit(): void {
    const { qbs, rbs, wrs, tes, dsts } = getAvailablePlayers(30);
    this.availableQuarterbacks.set(qbs);
    this.availableRunningBacks = rbs;
    this.availableWideReceivers = wrs;
    this.availableTightEnds = tes;
    this.availableDsts = dsts;

    console.log('Available Quarterbacks:', qbs);
    console.log('Available Running Backs:', rbs);
    console.log('Available Wide Receivers:', wrs);
    console.log('Available Tight Ends:', tes);
    console.log('Available Defenses:', dsts);
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
    console.log('Updated Quarterbacks:', newQuarterbacks);
    this.qbSelectionFormGroup.controls.qbPoolCtrl.setValue(newQuarterbacks);
  }

  updateRunningBacks(newRunningBacks: RunningBack[]) {
    console.log('Updated Running Backs:', newRunningBacks);
    this.rbSelectionFormGroup.controls.rbPoolCtrl.setValue(newRunningBacks);
  }

  updateWideReceivers(newWideReceivers: WideReceiver[]) {
    console.log('Updated Wide Receivers:', newWideReceivers);
    this.wrSelectionFormGroup.controls.wrPoolCtrl.setValue(newWideReceivers);
  }

  updateTightEnds(newTightEnds: TightEnd[]) {
    console.log('Updated Tight ends:', newTightEnds);
    this.teSelectionFormGroup.controls.tePoolCtrl.setValue(newTightEnds);
  }

  updateDsts(newDsts: Player[]) {
    console.log('Updated DSTs:', newDsts);
    this.dstSelectionFormGroup.controls.dstPoolCtrl.setValue(newDsts);
  }
}
