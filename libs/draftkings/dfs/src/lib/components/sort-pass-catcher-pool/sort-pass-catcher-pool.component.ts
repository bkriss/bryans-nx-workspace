import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PassCatcher } from '../../models';
import { calculateGrade } from '../../utils';
import { Position } from '../../enums';

@Component({
  selector: 'dfs-sort-pass-catcher-pool',
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    MatFormFieldModule,
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
  @Output() updatePassCatchers = new EventEmitter<PassCatcher[]>();

  dropPassCatcher(event: CdkDragDrop<PassCatcher[]>) {
    moveItemInArray(this.passCatchers, event.previousIndex, event.currentIndex);

    const passCatchers: PassCatcher[] = this.passCatchers.map((player, i) => {
      const { position } = player;
      const generalMax =
        position === Position.WR ? 28 - i : 25 - Math.ceil(i * 3);
      const generalMin =
        position === Position.WR ? 20 - i : 17 - Math.ceil(i * 3);

      return {
        ...player,
        gradeOutOfTen: Number(calculateGrade(i)),
        maxOwnershipPercentage: generalMax >= 0 ? generalMax : 0,
        minOwnershipPercentage: generalMin >= 0 ? generalMin : 0,
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
    this.updatePassCatchers.emit(passCatchers);
  }
}
