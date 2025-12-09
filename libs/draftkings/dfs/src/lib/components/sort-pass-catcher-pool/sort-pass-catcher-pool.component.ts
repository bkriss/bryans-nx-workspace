import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  PassCatcher,
  Player,
  PlayerSelectionStore,
  Position,
} from '@bryans-nx-workspace/draftkings-shared';
import { calculateGrade } from '../../utils';

@Component({
  selector: 'dfs-sort-pass-catcher-pool',
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './sort-pass-catcher-pool.component.html',
  styleUrl: './sort-pass-catcher-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortPassCatcherPoolComponentComponent {
  @Input() passCatchers: PassCatcher[] = [];
  @Input() position: Position = Position.WR;
  @Output() selectPlayersBasedOnProjections = new EventEmitter<Position>();
  private readonly playerSelectionStore = inject(PlayerSelectionStore);

  dropPassCatcher(event: CdkDragDrop<PassCatcher[]>) {
    moveItemInArray(this.passCatchers, event.previousIndex, event.currentIndex);

    const passCatchers: PassCatcher[] = this.passCatchers.map((player, i) => {
      const { position } = player;
      let maxOwnershipPercentage =
        position === Position.WR ? 26 - i : 20 - Math.ceil(i * 2);
      let minOwnershipPercentage =
        position === Position.WR ? 20 - i : 14 - Math.ceil(i * 2);

      if (position === Position.WR) {
        if (i >= 15 && i <= 19) {
          maxOwnershipPercentage = 5;
          minOwnershipPercentage = 0;
        }

        if (i >= 20 && i <= 24) {
          maxOwnershipPercentage = 3;
          minOwnershipPercentage = 0;
        }

        if (i >= 25) {
          maxOwnershipPercentage = 1;
          minOwnershipPercentage = 0;
        }
      }

      if (position === Position.TE) {
        if (i >= 5) {
          maxOwnershipPercentage = 13 - i;
          minOwnershipPercentage = 7 - i;
        }
      }

      maxOwnershipPercentage =
        maxOwnershipPercentage >= 0 ? maxOwnershipPercentage : 1;
      minOwnershipPercentage =
        minOwnershipPercentage >= 0 ? minOwnershipPercentage : 0;

      return {
        ...player,
        onlyUseInLargerFieldContests: i >= 20,
        gradeOutOfTen: calculateGrade(i),
        maxOwnershipPercentage:
          player.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb
            ? 0
            : maxOwnershipPercentage,
        minOwnershipPercentage:
          player.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb
            ? 0
            : minOwnershipPercentage,
        maxOwnershipWhenPairedWithQb: Number(
          player.maxOwnershipWhenPairedWithQb
        ),
        minOwnershipWhenPairedWithQb: Number(
          player.minOwnershipWhenPairedWithQb
        ),
        maxOwnershipWhenPairedWithOpposingQb: Number(
          player.maxOwnershipWhenPairedWithOpposingQb
        ),
        minOwnershipWhenPairedWithOpposingQb: Number(
          player.minOwnershipWhenPairedWithOpposingQb
        ),
      };
    });

    console.log('Updated Pass Catchers:', passCatchers);

    if (this.position === Position.WR) {
      this.playerSelectionStore.setWideReceivers(passCatchers);
    } else {
      this.playerSelectionStore.setTightEnds(passCatchers);
    }
  }

  makeSuggestedSelections() {
    this.selectPlayersBasedOnProjections.emit(this.position);
  }

  savePassCatcherSelections(): void {
    this.playerSelectionStore.saveSelectedPlayersToFirestore(this.position);
  }

  removePlayerFromPool(player: Player, position: Position): void {
    switch (position) {
      case Position.QB:
        this.playerSelectionStore.removeQuarterback(player.id);
        break;
      case Position.RB:
        this.playerSelectionStore.removeRunningBack(player.id);
        break;
      case Position.WR:
        this.playerSelectionStore.removeWideReceiver(player.id);
        break;
      case Position.TE:
        this.playerSelectionStore.removeTightEnd(player.id);
        break;
      case Position.DST:
        this.playerSelectionStore.removeDefense(player.id);
        break;
      default:
        console.warn('Unknown position: ', position);
        break;
    }
  }
}
