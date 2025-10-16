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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Player, Quarterback, TightEnd, WideReceiver } from '../../models';

@Component({
  selector: 'dfs-sort-player-pool',
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './sort-player-pool.component.html',
  styleUrl: './sort-player-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortPlayerPoolComponent {
  @Input() quarterbacks: Quarterback[] = [];
  @Input() runningBacks: Player[] = [];
  @Input() wideReceivers: WideReceiver[] = [];
  @Input() tightEnds: TightEnd[] = [];
  @Input() dsts: Player[] = [];
  @Output() updateQuarterbacks = new EventEmitter<Quarterback[]>();
  @Output() updateRunningBacks = new EventEmitter<Player[]>();
  @Output() updateWideReceivers = new EventEmitter<WideReceiver[]>();
  @Output() updateTightEnds = new EventEmitter<TightEnd[]>();
  @Output() updateDsts = new EventEmitter<Player[]>();

  // TODO: Remove setTimeouts
  dropQuarterback(event: CdkDragDrop<Quarterback[]>) {
    moveItemInArray(this.quarterbacks, event.previousIndex, event.currentIndex);

    console.log('Updated Quarterbacks 1:', this.quarterbacks);
    setTimeout(() => {
      console.log('Updated Quarterbacks 2:', this.quarterbacks);
      this.updateQuarterbacks.emit(this.quarterbacks);
    }, 0);
  }

  dropRunningBack(event: CdkDragDrop<Player[]>) {
    moveItemInArray(this.runningBacks, event.previousIndex, event.currentIndex);

    console.log('Updated Running Backs 1:', this.runningBacks);
    setTimeout(() => {
      console.log('Updated Running Backs 2:', this.runningBacks);
      this.updateRunningBacks.emit(this.runningBacks);
    }, 0);
  }

  dropWideReceiver(event: CdkDragDrop<WideReceiver[]>) {
    moveItemInArray(
      this.wideReceivers,
      event.previousIndex,
      event.currentIndex
    );

    console.log('Updated Wide Receivers 1:', this.wideReceivers);

    setTimeout(() => {
      console.log('Updated Wide Receivers 2:', this.wideReceivers);
      this.updateWideReceivers.emit(this.wideReceivers);
    }, 0);
  }

  dropTightEnd(event: CdkDragDrop<TightEnd[]>) {
    moveItemInArray(this.tightEnds, event.previousIndex, event.currentIndex);

    console.log('Updated Tight Ends 1:', this.tightEnds);

    setTimeout(() => {
      console.log('Updated Tight Ends 2:', this.tightEnds);
      this.updateTightEnds.emit(this.tightEnds);
    }, 0);
  }

  dropDst(event: CdkDragDrop<Player[]>) {
    moveItemInArray(this.dsts, event.previousIndex, event.currentIndex);

    console.log('Updated DSTs 1:', this.dsts);
    this.updateDsts.emit(this.dsts);
  }
}
