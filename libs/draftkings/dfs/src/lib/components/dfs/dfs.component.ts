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

import { getAvailablePlayers } from '../../utils';
import { Player, Quarterback, TightEnd, WideReceiver } from '../../models';
import { Router } from '@angular/router';
import { SortPlayerPoolComponent } from '../sort-player-pool/sort-player-pool.component';

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
    SortPlayerPoolComponent,
  ],
  templateUrl: './dfs.component.html',
  styleUrl: './dfs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DfsComponent implements OnInit {
  private router = inject(Router);
  availableQuarterbacks: WritableSignal<Quarterback[]> = signal([]);
  availableRunningBacks: Player[] = [];
  availableWideReceivers: Player[] = [];
  availableTightEnds: Player[] = [];
  availableDsts: Player[] = [];

  protected playerPool = [];
  private _formBuilder = inject(FormBuilder);

  qbSelectionFormGroup = this._formBuilder.group({
    qbPoolCtrl: [
      [] as Quarterback[],
      [Validators.minLength(4), Validators.maxLength(6)],
    ],
  });
  rbSelectionFormGroup = this._formBuilder.group({
    rbPoolCtrl: [
      [] as Player[],
      [Validators.minLength(5), Validators.maxLength(10)],
    ],
  });
  wrSelectionFormGroup = this._formBuilder.group({
    wrPoolCtrl: [
      [] as WideReceiver[],
      [Validators.minLength(18), Validators.maxLength(30)],
    ],
  });
  teSelectionFormGroup = this._formBuilder.group({
    tePoolCtrl: [
      [] as TightEnd[],
      [Validators.minLength(4), Validators.maxLength(7)],
    ],
  });
  dstSelectionFormGroup = this._formBuilder.group({
    dstPoolCtrl: [
      [] as Player[],
      [Validators.minLength(4), Validators.maxLength(7)],
    ],
  });

  ngOnInit(): void {
    const { qbs, rbs, wrs, tes, dsts } = getAvailablePlayers(20);
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

  // TODO: Remove?
  onSelectionChanged(event: any) {
    console.log('Selection changed:', event);
  }

  generateLineupBuilders() {
    // Implement your lineup generation logic here
    console.log(
      'Selected QBs:',
      this.qbSelectionFormGroup.controls.qbPoolCtrl.value
    );
    console.log(
      'Selected RBs:',
      this.rbSelectionFormGroup.controls.rbPoolCtrl.value
    );
    console.log(
      'Selected WRs:',
      this.wrSelectionFormGroup.controls.wrPoolCtrl.value
    );
    console.log(
      'Selected TEs:',
      this.teSelectionFormGroup.controls.tePoolCtrl.value
    );

    // TODO: Save selections to state and navigate to lineup builders page
    this.router.navigate(['/dfs/lineup-builders']);
  }

  updateRunningBacks(newRunningBacks: Player[]) {
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
}
