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
  Lineup,
  Player,
  Quarterback,
  TightEnd,
  WideReceiver,
} from '../../models';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { LineupBuilderPositionComponent } from '../lineup-builder-position/lineup-builder-position.component';

@Component({
  selector: 'dfs-lineup-builder',
  imports: [
    CommonModule,
    LineupBuilderPositionComponent,
    // TODO: Remove Material imports
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './lineup-builder.component.html',
  styleUrl: './lineup-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuilderComponent {
  @Input() lineup!: Lineup;
  @Input() qbPool!: Quarterback[];
  @Input() runningBackPool!: Player[];
  @Input() wideReceiverPool!: WideReceiver[];
  @Input() tightEndPool!: TightEnd[];
  @Input() dstPool!: Player[];
  @Output() updateLineup = new EventEmitter<Lineup>();
  dialog = inject(MatDialog);

  removeQuarterback(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      qb: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeRb1(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      rb1: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeRb2(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      rb2: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeWr1(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      wr1: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeWr2(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      wr2: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeWr3(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      wr3: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeTightEnd(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      te: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeFlex(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      flex: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  removeDst(playerToRemove: Player): void {
    this.updateLineup.emit({
      ...this.lineup,
      dst: null,
      remainingSalary: this.lineup.remainingSalary + playerToRemove.salary,
    });
  }

  selectQb(): void {
    console.log('Select QB clicked');
  }

  selectRb(): void {
    console.log('Select RB clicked');
  }

  // TODO: Delete modal component and related code
  selectPlayer(position: string, player: Player): void {
    console.log(`${player.name} selected for position: ${position}`);

    this.updateLineup.emit({
      ...this.lineup,
      [position.toLowerCase()]: player,
      remainingSalary: this.lineup.remainingSalary - player.salary,
    });

    // console.log('Opening dialog...', this.availableWideReceivers);
    // const availableWideReceivers = this.wideReceiverPool.filter(
    //   (player) =>
    //     player.id !== this.lineup.wr1?.id &&
    //     player.id !== this.lineup.wr2?.id &&
    //     player.id !== this.lineup.wr3?.id &&
    //     player.id !== this.lineup.flex?.id
    // );

    // this.dialog.open(SelectPlayerModalComponent, {
    //   data: {
    //     position,
    //     // availableQuarterbacks: this.availableQuarterbacks,
    //     // availableRunningBacks: this.availableRunningBacks,
    //     availableWideReceivers,
    //     // availableTightEnds: this.availableTightEnds,
    //     // availableDsts: this.availableDsts,
    //   },
    // });
  }
}
