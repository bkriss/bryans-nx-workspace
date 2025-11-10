import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  signal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Lineup,
  PassCatcher,
  Player,
  PlayerDistribution,
  Quarterback,
  RunningBack,
  // TightEnd,
  // WideReceiver,
} from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Position } from '../../enums';

@Component({
  selector: 'dfs-player-distributions',
  imports: [CommonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './player-distributions.component.html',
  styleUrl: './player-distributions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerDistributionsComponent {
  @Input() currentQb!: Quarterback;
  @Input() lineups: Signal<Lineup[]> = signal([]);
  @Input() rbPool: RunningBack[] = [];
  @Input() wrPool: PassCatcher[] = [];
  @Input() tePool: PassCatcher[] = [];
  @Input() dstPool: Player[] = [];

  runningBackDistribution: Signal<PlayerDistribution[]> = computed(() =>
    this.rbPool
      .map((rb) => this.calculatePlayerDistribution(rb as Player, Position.RB))
      .sort((a, b) => b.count - a.count)
  );

  wideReceiverDistribution: Signal<PlayerDistribution[]> = computed(() =>
    this.wrPool
      .map((wr) => this.calculatePlayerDistribution(wr as Player, Position.WR))
      .sort((a, b) => b.count - a.count)
  );

  tightEndDistribution: Signal<PlayerDistribution[]> = computed(() =>
    this.tePool
      .map((te) => this.calculatePlayerDistribution(te as Player, Position.TE))
      .sort((a, b) => b.count - a.count)
  );

  dstDistribution: Signal<PlayerDistribution[]> = computed(() =>
    this.dstPool
      .map((dst) =>
        this.calculatePlayerDistribution(dst as Player, Position.DST)
      )
      .sort((a, b) => b.count - a.count)
  );

  calculatePercentageDifference(data: {
    overLimit: boolean;
    underMinimumRequirement: boolean;
    percentageOfLineups: number;
    minRequirement: number;
    maxLimit: number;
  }): string {
    const {
      overLimit,
      underMinimumRequirement,
      percentageOfLineups,
      minRequirement,
      maxLimit,
    } = data;
    let percentageDifference = '';
    if (overLimit) {
      percentageDifference = `+${Math.ceil(percentageOfLineups - maxLimit)}%`;
    } else if (underMinimumRequirement) {
      percentageDifference = `-${Math.ceil(
        minRequirement - percentageOfLineups
      )}%`;
    }

    return percentageDifference;
  }

  calculatePlayerDistribution(
    player: Player,
    position: Position
  ): PlayerDistribution {
    let count = 0;
    let overLimit = false;
    let underMinimumRequirement = false;
    let percentageDifference = '';
    let maxLimit = 0;
    let minRequirement = 0;

    if (position === Position.QB) {
      count = this.lineups().filter(
        (lineup) => lineup.qb?.id === player.id
      ).length;
    } else if (position === Position.RB) {
      count = this.lineups().filter(
        (lineup) =>
          lineup.rb1?.id === player.id ||
          lineup.rb2?.id === player.id ||
          lineup.flex?.id === player.id
      ).length;
    } else if (position === Position.WR) {
      count = this.lineups().filter(
        (lineup) =>
          lineup.wr1?.id === player.id ||
          lineup.wr2?.id === player.id ||
          lineup.wr3?.id === player.id ||
          lineup.flex?.id === player.id
      ).length;
    } else if (position === Position.TE) {
      count = this.lineups().filter(
        (lineup) => lineup.te?.id === player.id || lineup.flex?.id === player.id
      ).length;
    } else if (position === Position.DST) {
      count = this.lineups().filter(
        (lineup) => lineup.dst?.id === player.id
      ).length;
    }

    const percentageOfLineups =
      (count / this.currentQb.numberOfLineupsWithThisPlayer) * 100;

    if (position === Position.WR || position === Position.TE) {
      const passCatcher = player as PassCatcher;
      const qbTeam = this.currentQb.teamAbbrev;
      const passCatcherTeam = passCatcher.teamAbbrev;
      const passCatcherOppTeam = passCatcher.opposingTeamAbbrev;

      if (qbTeam === passCatcherTeam) {
        overLimit =
          percentageOfLineups > (passCatcher.maxOwnershipWhenPairedWithQb || 0);
        underMinimumRequirement =
          percentageOfLineups < (passCatcher.minOwnershipWhenPairedWithQb || 0);
        minRequirement = passCatcher.minOwnershipWhenPairedWithQb || 0;
        maxLimit = passCatcher.maxOwnershipWhenPairedWithQb || 0;
      } else if (qbTeam === passCatcherOppTeam) {
        overLimit =
          percentageOfLineups >
          (passCatcher.maxOwnershipWhenPairedWithOpposingQb || 0);
        underMinimumRequirement =
          percentageOfLineups <
          (passCatcher.minOwnershipWhenPairedWithOpposingQb || 0);
        minRequirement = passCatcher.minOwnershipWhenPairedWithOpposingQb || 0;
        maxLimit = passCatcher.maxOwnershipWhenPairedWithOpposingQb || 0;
      } else {
        overLimit = percentageOfLineups > player.maxOwnershipPercentage;
        underMinimumRequirement =
          percentageOfLineups < player.minOwnershipPercentage;
        minRequirement = player.minOwnershipPercentage;
        maxLimit = player.maxOwnershipPercentage;
      }
    } else {
      overLimit = percentageOfLineups > player.maxOwnershipPercentage;
      underMinimumRequirement =
        percentageOfLineups < player.minOwnershipPercentage;
      minRequirement = player.minOwnershipPercentage;
      maxLimit = player.maxOwnershipPercentage;
    }

    percentageDifference = this.calculatePercentageDifference({
      overLimit,
      underMinimumRequirement,
      percentageOfLineups,
      minRequirement,
      maxLimit,
    });

    return {
      count,
      name: player.name,
      overLimit,
      percentageDifference,
      percentageOfLineups,
      playerId: player.id,
      teamAbbrev: player.teamAbbrev,
      opposingTeamAbbrev: player.opposingTeamAbbrev,
      underMinimumRequirement,
    };
  }
}
