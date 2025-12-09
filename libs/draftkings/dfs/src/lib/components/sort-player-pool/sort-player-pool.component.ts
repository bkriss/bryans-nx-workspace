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
  Player,
  Quarterback,
  RunningBack,
  PlayerSelectionStore,
  Position,
} from '@bryans-nx-workspace/draftkings-shared';
import { calculateGrade } from '../../utils';

@Component({
  selector: 'dfs-sort-player-pool',
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
  templateUrl: './sort-player-pool.component.html',
  styleUrl: './sort-player-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortPlayerPoolComponent {
  @Input() position: Position = Position.WR;
  @Input() quarterbacks: Quarterback[] = [];
  @Input() runningBacks: RunningBack[] = [];
  @Input() dsts: Player[] = [];
  @Output() selectPlayersBasedOnProjections = new EventEmitter<Position>();
  private readonly playerSelectionStore = inject(PlayerSelectionStore);

  dropQuarterback(event: CdkDragDrop<Quarterback[]>) {
    moveItemInArray(this.quarterbacks, event.previousIndex, event.currentIndex);

    const quarterbacks = this.quarterbacks.map((qb, i) => {
      return {
        ...qb,
        gradeOutOfTen: calculateGrade(i),
        sortOrder: i + 1,
        numberOfLineupsWithThisPlayer: +qb.numberOfLineupsWithThisPlayer,
      };
    });

    console.log('Updated Quarterbacks: ', quarterbacks);
    this.playerSelectionStore.setQuarterbacks(quarterbacks);
  }

  dropRunningBack(event: CdkDragDrop<RunningBack[]>) {
    moveItemInArray(this.runningBacks, event.previousIndex, event.currentIndex);

    const runningBacks = this.runningBacks.map((rb, i) => {
      let maxOwnershipPercentage = 0;
      let minOwnershipPercentage = 0;

      if (i >= 0 && i <= 2) {
        maxOwnershipPercentage = 33;
        minOwnershipPercentage = 25;
      }

      if (i >= 3) {
        maxOwnershipPercentage = 33 - i;
        minOwnershipPercentage = 25 - i;
      }

      if (i >= 7) {
        maxOwnershipPercentage = 50 - Math.ceil(i * 4);
        minOwnershipPercentage = 42 - Math.ceil(i * 4);
      }

      maxOwnershipPercentage =
        maxOwnershipPercentage > 0 ? maxOwnershipPercentage : 1;
      minOwnershipPercentage =
        minOwnershipPercentage >= 0 ? minOwnershipPercentage : 0;

      return {
        ...rb,
        allowOnlyAsFlex: i >= 8,
        gradeOutOfTen: calculateGrade(i),
        maxOwnershipPercentage,
        minOwnershipPercentage,
        useAsAlternate: i === 7,
      };
    });

    console.log('Updated Running Backs: ', runningBacks);
    this.playerSelectionStore.setRunningBacks(runningBacks);
  }

  dropDst(event: CdkDragDrop<Player[]>) {
    moveItemInArray(this.dsts, event.previousIndex, event.currentIndex);

    const dsts = this.dsts.map((dst, i) => {
      let maxOwnershipPercentage = 25 - Math.ceil(i * 2);
      let minOwnershipPercentage = maxOwnershipPercentage - 8;

      if (i >= 8) {
        maxOwnershipPercentage = 1;
        minOwnershipPercentage = 0;
      }

      return {
        ...dst,
        gradeOutOfTen: calculateGrade(i, 1),
        maxOwnershipPercentage:
          maxOwnershipPercentage >= 1 ? maxOwnershipPercentage : 1,
        minOwnershipPercentage:
          minOwnershipPercentage >= 0 ? minOwnershipPercentage : 0,
      };
    });

    console.log('Updated DSTs: ', dsts);
    this.playerSelectionStore.setDefenses(dsts);
  }

  makeSuggestedSelections() {
    this.selectPlayersBasedOnProjections.emit(this.position);
  }

  savePlayerSelections(): void {
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
