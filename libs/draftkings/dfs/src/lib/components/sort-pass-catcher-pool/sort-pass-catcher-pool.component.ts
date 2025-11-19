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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PassCatcher, Player } from '../../models';
import { calculateGrade } from '../../utils';
import { Position } from '../../enums';
import { PlayerPoolsStore } from '../../store';
import { MatButtonModule } from '@angular/material/button';

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
  private readonly playerPoolsStore = inject(PlayerPoolsStore);

  dropPassCatcher(event: CdkDragDrop<PassCatcher[]>) {
    moveItemInArray(this.passCatchers, event.previousIndex, event.currentIndex);

    const passCatchers: PassCatcher[] = this.passCatchers.map((player, i) => {
      const { position } = player;
      const generalMax =
        position === Position.WR ? 30 - i : 25 - Math.ceil(i * 3);
      const generalMin =
        position === Position.WR ? 22 - i : 17 - Math.ceil(i * 3);

      const maxOwnershipPercentage = generalMax >= 3 ? generalMax : 3;
      const minOwnershipPercentage = generalMin >= 0 ? generalMin : 0;
      return {
        ...player,
        gradeOutOfTen: Number(calculateGrade(i)),
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
      this.playerPoolsStore.setWideReceivers(passCatchers);
    } else {
      this.playerPoolsStore.setTightEnds(passCatchers);
    }
  }

  makeSuggestedSelections() {
    this.selectPlayersBasedOnProjections.emit(this.position);
  }

  savePassCatcherSelections(): void {
    this.playerPoolsStore.savePlayerPoolsToFirestore();
  }

  removePlayerFromPool(player: Player, position: Position): void {
    switch (position) {
      case Position.QB:
        this.playerPoolsStore.removeQuarterback(player.id);
        break;
      case Position.RB:
        this.playerPoolsStore.removeRunningBack(player.id);
        break;
      case Position.WR:
        this.playerPoolsStore.removeWideReceiver(player.id);
        break;
      case Position.TE:
        this.playerPoolsStore.removeTightEnd(player.id);
        break;
      case Position.DST:
        this.playerPoolsStore.removeDefense(player.id);
        break;
      default:
        console.warn('Unknown position: ', position);
        break;
    }
  }
}
