import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlayerSelectionStore } from '@bryans-nx-workspace/draftkings-shared';

@Component({
  selector: 'dfs-qb-pass-catcher-ownership',
  imports: [],
  templateUrl: './qb-pass-catcher-ownership.component.html',
  styleUrl: './qb-pass-catcher-ownership.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QbPassCatcherOwnershipComponent {
  private readonly playerSelectionStore = inject(PlayerSelectionStore);

  selectedQuarterbacks = this.playerSelectionStore.quarterbacks;
  selectedRunningBacks = this.playerSelectionStore.runningBacks;
  selectedWideReceivers = this.playerSelectionStore.wideReceivers;
  selectedTightEnds = this.playerSelectionStore.tightEnds;
}
