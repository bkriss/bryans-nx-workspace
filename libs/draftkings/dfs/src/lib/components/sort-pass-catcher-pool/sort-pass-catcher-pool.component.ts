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
import { PassCatcher, Player } from '../../models';
import { calculateGrade } from '../../utils';
import { Position } from '../../enums';
import { PlayerSelectionStore } from '../../store';

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
        position === Position.WR ? 28 - i : 23 - Math.ceil(i * 3);
      let minOwnershipPercentage =
        position === Position.WR ? 22 - i : 15 - Math.ceil(i * 3);

      if (position === Position.WR) {
        if (i > 14 && i < 20) {
          maxOwnershipPercentage = 8;
          minOwnershipPercentage = 0;
        }

        if (i > 19 && i < 25) {
          maxOwnershipPercentage = 5;
          minOwnershipPercentage = 0;
        }

        if (i >= 25) {
          maxOwnershipPercentage = 2;
          minOwnershipPercentage = 0;
        }
      }

      maxOwnershipPercentage =
        maxOwnershipPercentage >= 2 ? maxOwnershipPercentage : 2;
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
