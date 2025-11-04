import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerOverlapImbalanceButtonComponent } from '../player-overlap-imbalance-button/player-overlap-imbalance-button.component';
import {
  Lineup,
  Player,
  PlayerDistribution,
  Quarterback,
  RunningBack,
  TightEnd,
  WideReceiver,
} from '../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlayerDistributionsComponent } from '../player-distributions/player-distributions.component';
import { LineupBuilderComponent } from '../lineup-builder/lineup-builder.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'dfs-lineups',
  imports: [
    CommonModule,
    FormsModule,
    LineupBuilderComponent,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    PlayerDistributionsComponent,
    PlayerOverlapImbalanceButtonComponent,
  ],
  templateUrl: './lineups.component.html',
  styleUrl: './lineups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupsComponent {
  @Input() currentQb: Signal<Quarterback> = signal({} as Quarterback);
  @Input() lineups: Signal<Lineup[]> = signal([]);
  @Input() qbPool: Quarterback[] = [];
  @Input() rbPool: RunningBack[] = [];
  @Input() wrPool: WideReceiver[] = [];
  @Input() tePool: TightEnd[] = [];
  @Input() dstPool: Player[] = [];

  @Input() runningBackDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() wideReceiverDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() tightEndDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() dstDistribution: Signal<PlayerDistribution[]> = signal([]);

  @Output() saveLineups = new EventEmitter<void>();
  @Output() updateLineup = new EventEmitter<Lineup>();
  @Output() selectedNewQuarterback = new EventEmitter<Quarterback>();
}
