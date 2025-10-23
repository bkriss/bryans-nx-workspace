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
import { PassCatcher, TightEnd, WideReceiver } from '../../models';
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
      return {
        ...player,
        gradeOutOfTen: calculateGrade(i),
      };
    });
    console.log('Updated Pass Catchers 1:', passCatchers);

    setTimeout(() => {
      console.log('Updated Pass Catcherss 2:', passCatchers);
      this.updatePassCatchers.emit(passCatchers);
    }, 0);
  }
}
