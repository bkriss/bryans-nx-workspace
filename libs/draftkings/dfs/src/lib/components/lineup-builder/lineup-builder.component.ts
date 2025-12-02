import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lineup, PassCatcher, Player, Quarterback } from '../../models';
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
export class LineupBuilderComponent implements OnInit {
  @Input() lineup!: Lineup;
  @Input() maxRemainingSalary = 300;
  @Input() qbPool!: Quarterback[];
  @Input() runningBackPool!: Player[];
  @Input() wideReceiverPool!: PassCatcher[];
  @Input() tightEndPool!: PassCatcher[];
  @Input() dstPool!: Player[];
  @Output() updateLineup = new EventEmitter<Lineup>();
  dialog = inject(MatDialog);
  flexPool: Player[] = [];

  ngOnInit() {
    this.sortPlayerPoolsBySalary();
  }

  sortPlayerPoolsBySalary() {
    this.qbPool.sort((a, b) => b.salary - a.salary);
    this.runningBackPool.sort((a, b) => b.salary - a.salary);
    this.wideReceiverPool.sort((a, b) => b.salary - a.salary);
    this.tightEndPool.sort((a, b) => b.salary - a.salary);
    this.flexPool = [
      ...this.wideReceiverPool,
      ...this.runningBackPool,
      ...this.tightEndPool,
    ].sort((a, b) => b.salary - a.salary);
    this.dstPool.sort((a, b) => b.salary - a.salary);
  }

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

  selectPlayer(position: string, player: Player): void {
    console.log(`${player.name} selected for position: ${position}`);

    this.updateLineup.emit({
      ...this.lineup,
      [position.toLowerCase()]: player,
      remainingSalary: this.lineup.remainingSalary - player.salary,
    });
  }
}
