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
import { Player, Quarterback, RunningBack } from '../../models';
import { calculateGrade } from '../../utils';
import { Position } from '../../enums';

@Component({
  selector: 'dfs-sort-player-pool',
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './sort-player-pool.component.html',
  styleUrl: './sort-player-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortPlayerPoolComponent {
  @Input() quarterbacks: Quarterback[] = [];
  @Input() runningBacks: RunningBack[] = [];
  @Input() dsts: Player[] = [];
  @Output() updateQuarterbacks = new EventEmitter<Quarterback[]>();
  @Output() updateRunningBacks = new EventEmitter<RunningBack[]>();
  @Output() updateDsts = new EventEmitter<Player[]>();

  // TODO: Remove setTimeouts
  dropQuarterback(event: CdkDragDrop<Quarterback[]>) {
    moveItemInArray(this.quarterbacks, event.previousIndex, event.currentIndex);

    const quarterbacks = this.quarterbacks.map((qb, i) => {
      return {
        ...qb,
        gradeOutOfTen: calculateGrade(i),
      };
    });

    console.log('Updated Quarterbacks 1:', quarterbacks);
    setTimeout(() => {
      console.log('Updated Quarterbacks 2:', quarterbacks);
      this.updateQuarterbacks.emit(quarterbacks);
    }, 0);
  }

  dropRunningBack(event: CdkDragDrop<RunningBack[]>) {
    moveItemInArray(this.runningBacks, event.previousIndex, event.currentIndex);

    const runningBacks = this.runningBacks.map((rb, i) => {
      return {
        ...rb,
        gradeOutOfTen: calculateGrade(i),
      };
    });

    console.log('Updated Running Backs 1:', runningBacks);
    setTimeout(() => {
      console.log('Updated Running Backs 2:', runningBacks);
      this.updateRunningBacks.emit(runningBacks);
    }, 0);
  }

  dropDst(event: CdkDragDrop<Player[]>) {
    moveItemInArray(this.dsts, event.previousIndex, event.currentIndex);

    const dsts = this.dsts.map((dst, i) => {
      const generalMax = 28 - Math.ceil(i * 2.5);
      const generalMin = 18 - Math.ceil(i * 2.5);

      return {
        ...dst,
        gradeOutOfTen: calculateGrade(i, 1),
        maxOwnershipPercentage: generalMax >= 0 ? generalMax : 0,
        minOwnershipPercentage: generalMin >= 0 ? generalMin : 0,
      };
    });

    console.log('Updated DSTs 1:', dsts);
    this.updateDsts.emit(dsts);
  }
}
