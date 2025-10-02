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
import { Player, Quarterback, TightEnd, WideReceiver } from '../../models';

@Component({
  selector: 'dfs-sort-player-pool',
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: './sort-player-pool.component.html',
  styleUrl: './sort-player-pool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortPlayerPoolComponent {
  @Input() quarterbacks: Quarterback[] = [];
  @Input() runningBacks: Player[] = [];
  @Input() wideReceivers: WideReceiver[] = [];
  @Input() tightEnds: TightEnd[] = [];
  @Output() updateRunningBacks = new EventEmitter<Player[]>();
  @Output() updateWideReceivers = new EventEmitter<WideReceiver[]>();
  @Output() updateTightEnds = new EventEmitter<TightEnd[]>();

  dropQuarterback(event: CdkDragDrop<Quarterback[]>) {
    console.log('dropQuarterback event: ', event);
    moveItemInArray(this.quarterbacks, event.previousIndex, event.currentIndex);
  }

  dropRunningBack(event: CdkDragDrop<Player[]>) {
    console.log('dropRunningBack event: ', event);
    moveItemInArray(this.runningBacks, event.previousIndex, event.currentIndex);

    console.log('Updated Running Backs 1:', this.runningBacks);
    setTimeout(() => {
      console.log('Updated Running Backs 2:', this.runningBacks);
      this.updateRunningBacks.emit(this.runningBacks);
    }, 0);
  }

  dropWideReceiver(event: CdkDragDrop<WideReceiver[]>) {
    console.log('dropWideReceiver event: ', event);
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
    console.log('dropTightEnd event: ', event);
    moveItemInArray(this.tightEnds, event.previousIndex, event.currentIndex);

    console.log('Updated Tight Ends 1:', this.tightEnds);

    setTimeout(() => {
      console.log('Updated Tight Ends 2:', this.tightEnds);
      this.updateTightEnds.emit(this.tightEnds);
    }, 0);
  }
}
