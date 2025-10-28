import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import {
  Lineup,
  PassCatcher,
  PassCatcherStack,
  Player,
  PlayerDistribution,
  Quarterback,
  RunningBack,
  TightEnd,
  WideReceiver,
} from '../../models';
import { LineupBuilderComponent } from '../lineup-builder/lineup-builder.component';

import {
  findCheapestPlayer,
  findCheapestPlayersSalary,
  findCheapestTightEnd,
  findSecondCheapestPlayersSalary,
  findThirdCheapestPlayersSalary,
} from '../../utils';
import { PlayerDistributionsComponent } from '../player-distributions/player-distributions.component';
import { Position } from '../../enums';
// import { max, min } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { PlayerOverlapImbalanceButtonComponent } from '../player-overlap-imbalance-button/player-overlap-imbalance-button.component';
import { MatButtonModule } from '@angular/material/button';
import {
  selectedDSTs,
  selectedQuarterbacks,
  selectedRunningBacks,
  selectedTightEnds,
  selectedWideReceivers,
} from '../../utils/selected-players.util';
import { EntriesComponent } from '../contests/entries.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    CommonModule,
    EntriesComponent,
    FormsModule,
    LineupBuilderComponent,
    MatButtonModule, // TODO: Remove
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatTabsModule,
    PlayerDistributionsComponent,
    PlayerOverlapImbalanceButtonComponent,
  ],
  templateUrl: './lineup-builders-page.component.html',
  styleUrl: './lineup-builders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuildersPageComponent implements OnInit {
  lineups: WritableSignal<Lineup[]> = signal([]);
  numberOfInvalidLineups: Signal<number> = computed(() =>
    this.validateLineups(this.lineups())
  );

  readonly panelOpenState = signal(true);

  qbPool: Quarterback[] = [...selectedQuarterbacks];
  rbPool: RunningBack[] = [...selectedRunningBacks];
  wrPool: WideReceiver[] = [...selectedWideReceivers];
  tePool: TightEnd[] = [...selectedTightEnds];
  dstPool: Player[] = [...selectedDSTs];
  // TODO: Set this value after view initialization so the select shows correct initial value?
  currentQb: WritableSignal<Quarterback> = signal(this.qbPool[0]);

  // TODO: Remove quarterbackDistribution?
  // quarterbackDistribution: Signal<PlayerDistribution[]> = computed(() =>
  //   this.qbPool
  //     .map((qb) => this.calculatePlayerDistribution(qb as Player, Position.QB))
  //     .sort((a, b) => b.count - a.count)
  // );

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

  ngOnInit(): void {
    this.generateQbPassCatcherPairings();
    this.generateLineups();
  }

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

    // const percentageOfLineups = (count / this.lineups().length) * 100;
    const percentageOfLineups =
      (count / this.currentQb().numberOfLineupsWithThisPlayer) * 100;

    if (position === Position.WR || position === Position.TE) {
      const passCatcher = player as PassCatcher;
      const qbTeam = this.currentQb().teamAbbrev;
      const passCatcherTeam = passCatcher.teamAbbrev;
      const passCatcherOppTeam = passCatcher.opposingTeamAbbrev;

      // overLimit =
      //   (qbTeam === passCatcherTeam &&
      //     percentageOfLineups >
      //       (passCatcher.maxOwnershipWhenPairedWithQb || 0)) ||
      //   (qbTeam === passCatcherOppTeam &&
      //     percentageOfLineups >
      //       (passCatcher.maxOwnershipWhenPairedWithOpposingQb || 0));

      // underMinimumRequirement =
      //   (qbTeam === passCatcherTeam &&
      //     percentageOfLineups <
      //       (passCatcher.minOwnershipWhenPairedWithQb || 0)) ||
      //   (qbTeam === passCatcherOppTeam &&
      //     percentageOfLineups <
      //       (passCatcher.minOwnershipWhenPairedWithOpposingQb || 0));

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

      // if (overLimit) {
      //   percentageDifference = `+${Math.ceil(
      //     percentageOfLineups - player.maxOwnershipPercentage
      //   )}%`;
      // } else if (underMinimumRequirement) {
      //   percentageDifference = `-${Math.ceil(
      //     player.minOwnershipPercentage - percentageOfLineups
      //   )}%`;
      // } else {
      //   percentageDifference = '';
      // }
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

  // TODO: Should this replace calculateTotalCostOfCheapestPossibleRemainingPlayers?
  calculateTotalCostOfCheapestPossibleRemainingPlayers2(
    currentLineup: Lineup,
    positionToExclude: string
  ): number {
    let totalCostOfCheapestPossibleRemainingPlayers = 0;
    // TODO: Make this a signal
    let restrictedDsts = [
      currentLineup.qb?.opposingTeamAbbrev,
      currentLineup.qb?.teamAbbrev,
      currentLineup.rb1?.opposingTeamAbbrev,
      currentLineup.rb2?.opposingTeamAbbrev,
    ];
    // TODO: Make this a signal
    let restrictedPassCatcherTeams = [
      currentLineup.qb?.teamAbbrev,
      currentLineup.qb?.opposingTeamAbbrev,
      currentLineup.rb1?.teamAbbrev,
      currentLineup.rb2?.teamAbbrev,
    ];
    // TODO: Make this a computed signal that updates when restrictedPassCatcherTeams updates
    let eligibleWideReceivers = this.wrPool.filter((wr) =>
      restrictedPassCatcherTeams.includes(wr.teamAbbrev)
    );
    // TODO: Make this a computed signal that updates when restrictedPassCatcherTeams updates
    let eligibleTightEnds = this.tePool.filter((te) =>
      restrictedPassCatcherTeams.includes(te.teamAbbrev)
    );

    console.log('eligibleTightEnds 111', eligibleTightEnds);

    const eligibleDsts = this.dstPool.filter(
      (dst) => !restrictedDsts.includes(dst.teamAbbrev)
    );

    if (!currentLineup.wr1 && positionToExclude !== 'WR1') {
      // const costOfCheapestWr = findCheapestPlayersSalary(eligibleWideReceivers);
      eligibleWideReceivers = this.wrPool.filter(
        (wr) => !restrictedPassCatcherTeams.includes(wr.teamAbbrev)
      );
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [
        ...restrictedDsts,
        cheapestEligibleWr.opposingTeamAbbrev,
      ];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      // eligibleWideReceivers = eligibleWideReceivers.filter(
      //   (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
      // eligibleTightEnds = eligibleTightEnds.filter(
      //   (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
    }

    if (!currentLineup.wr2 && positionToExclude !== 'WR2') {
      eligibleWideReceivers = this.wrPool.filter(
        (wr) => !restrictedPassCatcherTeams.includes(wr.teamAbbrev)
      );
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [
        ...restrictedDsts,
        cheapestEligibleWr.opposingTeamAbbrev,
      ];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      // eligibleWideReceivers = eligibleWideReceivers.filter(
      //   (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
      // eligibleTightEnds = eligibleTightEnds.filter(
      //   (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
    }

    if (!currentLineup.wr3 && positionToExclude !== 'WR3') {
      eligibleWideReceivers = this.wrPool.filter(
        (wr) => !restrictedPassCatcherTeams.includes(wr.teamAbbrev)
      );
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [
        ...restrictedDsts,
        cheapestEligibleWr.opposingTeamAbbrev,
      ];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      // eligibleWideReceivers = eligibleWideReceivers.filter(
      //   (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
      // eligibleTightEnds = eligibleTightEnds.filter(
      //   (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
    }

    if (!currentLineup.te && positionToExclude !== 'TE') {
      eligibleTightEnds = this.tePool.filter(
        (te) => !restrictedPassCatcherTeams.includes(te.teamAbbrev)
      );
      const cheapestEligibleTe = findCheapestTightEnd(eligibleTightEnds);

      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleTe.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [
        ...restrictedDsts,
        cheapestEligibleTe.opposingTeamAbbrev,
      ];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleTe.teamAbbrev,
      ];
      // eligibleWideReceivers = eligibleWideReceivers.filter(
      //   (wr) => wr.teamAbbrev !== cheapestEligibleTe.teamAbbrev
      // );
    }

    if (!currentLineup.flex && positionToExclude !== 'FLEX') {
      eligibleWideReceivers = this.wrPool.filter(
        (wr) => !restrictedPassCatcherTeams.includes(wr.teamAbbrev)
      );
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [
        ...restrictedDsts,
        cheapestEligibleWr.opposingTeamAbbrev,
      ];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      // eligibleWideReceivers = eligibleWideReceivers.filter(
      //   (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      // );
    }

    if (!currentLineup.dst && positionToExclude !== 'DST') {
      const costOfCheapestDst = findCheapestPlayersSalary(eligibleDsts);
      totalCostOfCheapestPossibleRemainingPlayers += costOfCheapestDst;
    }

    return totalCostOfCheapestPossibleRemainingPlayers;
  }

  calculateTotalCostOfCheapestPossibleRemainingPlayers(
    passCatcherCombo: PassCatcher[],
    qb: Quarterback,
    rb1: Player,
    rb2: Player
  ): number {
    const restrictedDsts = [
      qb.opposingTeamAbbrev,
      qb.teamAbbrev,
      rb1.opposingTeamAbbrev,
      rb2.opposingTeamAbbrev,
    ];

    // Not allowing pass catchers to be on QB team or QB opponent because we've already added QB stacks at this point
    // TODO: Filter out players from passCatcherCombo so we avoid duplicates
    const restrictedPassCatcherTeams = [
      qb.teamAbbrev,
      qb.opposingTeamAbbrev,
      rb1.teamAbbrev,
      rb2.teamAbbrev,
    ];

    const eligibleDsts = this.dstPool.filter(
      (dst) => !restrictedDsts.includes(dst.teamAbbrev)
    );
    const eligibleWideReceivers = this.wrPool.filter((wr) =>
      restrictedPassCatcherTeams.includes(wr.teamAbbrev)
    );
    const eligibleTightEnds = this.tePool.filter((te) =>
      restrictedPassCatcherTeams.includes(te.teamAbbrev)
    );

    // const costOfCheapestDefense = findCheapestPlayersSalary(eligibleDsts);
    const costOfCheapestDefense = 3000;
    const costOfCheapestWr = findCheapestPlayersSalary(eligibleWideReceivers);
    const costOfCheapestTe = findCheapestPlayersSalary(eligibleTightEnds);
    const costOfSecondCheapestWr = findSecondCheapestPlayersSalary(
      eligibleWideReceivers
    );
    const costOfThirdCheapestWr = findThirdCheapestPlayersSalary(
      eligibleWideReceivers
    );

    /*
* Rules:
* If a TE is included in the passCatcherCombo, then the cheapest possible remaining players would be:
* 

*/
    let totalCostOfCheapestPossibleRemainingPlayers = 0;
    const passCatcherComboIncludesTightEnd = passCatcherCombo.find(
      (players) => players.position === 'TE'
    );
    if (passCatcherCombo.length === 2) {
      totalCostOfCheapestPossibleRemainingPlayers =
        costOfCheapestDefense + // DST
        costOfCheapestWr + // WR1
        costOfSecondCheapestWr;

      if (passCatcherComboIncludesTightEnd) {
        totalCostOfCheapestPossibleRemainingPlayers += costOfCheapestTe;
      } else {
        totalCostOfCheapestPossibleRemainingPlayers += costOfThirdCheapestWr;
      }
    } else if (passCatcherCombo.length === 3) {
      totalCostOfCheapestPossibleRemainingPlayers =
        costOfCheapestDefense + // DST
        costOfCheapestWr;

      if (passCatcherComboIncludesTightEnd) {
        totalCostOfCheapestPossibleRemainingPlayers += costOfCheapestTe;
      } else {
        totalCostOfCheapestPossibleRemainingPlayers += costOfSecondCheapestWr;
      }
    }

    return totalCostOfCheapestPossibleRemainingPlayers;
  }

  addRandomizedGradeToQbPassCatcherPairings(
    qbPassCatcherPairings: PassCatcherStack[]
  ): PassCatcherStack[] {
    return qbPassCatcherPairings
      .map((stack: PassCatcherStack) => {
        let randomizedGrade = 0;
        stack.passCatchers.forEach((player: PassCatcher) => {
          randomizedGrade += player.gradeOutOfTen + 3 * Math.random();
        });

        if (stack.passCatchers.length === 1) {
          randomizedGrade = randomizedGrade * 3;
        }

        if (stack.passCatchers.length === 2) {
          randomizedGrade = (randomizedGrade / 2) * 3;
        }

        return {
          ...stack,
          randomizedGrade,
        };
      })
      .sort((a, b) => b.randomizedGrade - a.randomizedGrade);
  }

  // TODO: Add logic that prevents multiple players from the same team unless they're pass catchers for that lineup's QB
  // TOOD: Add logic to account for onlyUseIfPartOfStackOrPlayingWithOrAgainstQb flag
  // TOOD: Add logic to account for requirePassCatcherFromOpposingTeam flag
  // TOOD: Add logic to increase probability of certain players being in certain lineups
  generateLineups(): void {
    console.log('Generating Lineups...');
    const rbCombosWithDuplicates = this.generateRbCombos(4);
    const lineupsArray: Lineup[] = [];
    const qb = this.currentQb();
    // this.qbPool.forEach((qb) => {
    if (!qb.numberOfLineupsWithThisPlayer) return;

    const filteredRbCombos = rbCombosWithDuplicates.filter(
      (rbCombo) =>
        rbCombo[0].teamAbbrev !== qb.teamAbbrev &&
        rbCombo[1].teamAbbrev !== qb.teamAbbrev &&
        rbCombo[0].teamAbbrev !== rbCombo[1].teamAbbrev
    );

    for (let i = 0; i < qb.numberOfLineupsWithThisPlayer; i++) {
      const rb1 = filteredRbCombos[i][0];
      const rb2 = filteredRbCombos[i][1];
      const totalRbComboSalary = rb1.salary + rb2.salary;
      let wr1: WideReceiver | null = null;
      let wr2: WideReceiver | null = null;
      let wr3: WideReceiver | null = null;
      let te: TightEnd | null = null;
      let flex: WideReceiver | null = null;
      let dst: Player | null = null;
      let remainingSalary = 50000;

      // TODO: If this doesn't end up being used, then delete addRandomizedGradeToQbPassCatcherPairings
      // const qbPassCatcherPairingsSortedByRandomGrade: PassCatcherStack[] =
      //   this.addRandomizedGradeToQbPassCatcherPairings(
      //     qb.qbPassCatcherPairings
      //   );

      const qbPassCatcherPairingsAccountingForPlayerLimits =
        qb.qbPassCatcherPairings.filter((pairing) => {
          const foundPlayerThatisOverLimit = pairing.passCatchers.some((pc) => {
            let passCatcherDistribution: PlayerDistribution | undefined;

            if (pc.position === 'WR') {
              passCatcherDistribution = this.wideReceiverDistribution().find(
                (dist) => dist.playerId === pc.id
              );
            } else {
              passCatcherDistribution = this.tightEndDistribution().find(
                (dist) => dist.playerId === pc.id
              );
            }

            if (!passCatcherDistribution) return true;

            const { percentageOfLineups } = passCatcherDistribution;

            const pairedWithQb = pc.teamAbbrev === qb.teamAbbrev;
            const pairedWithOpposingQb =
              pc.teamAbbrev === qb.opposingTeamAbbrev;

            return (
              (pairedWithQb &&
                percentageOfLineups >=
                  (pc.maxOwnershipWhenPairedWithQb || 0)) ||
              (pairedWithOpposingQb &&
                percentageOfLineups >=
                  (pc.maxOwnershipWhenPairedWithOpposingQb || 0))
            );
          });
          return !foundPlayerThatisOverLimit;
        });

      const qbPassCatcherPairingsSortedByRandomGrade: PassCatcherStack[] =
        this.addRandomizedGradeToQbPassCatcherPairings(
          qbPassCatcherPairingsAccountingForPlayerLimits
        );

      console.log('qbPassCatcherPairings 1', qb.qbPassCatcherPairings);
      console.log(
        'qbPassCatcherPairings 2',
        qbPassCatcherPairingsAccountingForPlayerLimits
      );
      console.log(
        'qbPassCatcherPairings 3',
        qbPassCatcherPairingsSortedByRandomGrade
      );
      // console.log(
      //   'qbPassCatcherPairingsAccountingForPlayerLimits',
      //   qbPassCatcherPairingsAccountingForPlayerLimits
      // );

      for (const passCatcherStack of qbPassCatcherPairingsSortedByRandomGrade) {
        const totalCostOfQbRbComboAndThisPassCatcherCombo =
          qb.salary -
          totalRbComboSalary -
          passCatcherStack.totalCostOfThisPassCatcherCombo;

        const totalCostOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers(
            passCatcherStack.passCatchers,
            qb,
            rb1,
            rb2
          );

        remainingSalary =
          50000 -
          totalCostOfQbRbComboAndThisPassCatcherCombo -
          totalCostOfCheapestPossibleRemainingPlayers;

        if (
          remainingSalary - totalCostOfCheapestPossibleRemainingPlayers >=
          0
        ) {
          if (passCatcherStack.passCatchers.length === 1) {
            if (passCatcherStack.passCatchers[0].position === 'TE') {
              te = passCatcherStack.passCatchers[0] as TightEnd;
            } else {
              wr1 = passCatcherStack.passCatchers[0] as WideReceiver;
            }
          } else if (passCatcherStack.passCatchers.length === 2) {
            if (passCatcherStack.passCatchers[0].position === 'TE') {
              te = passCatcherStack.passCatchers[0] as TightEnd;
              wr1 = passCatcherStack.passCatchers[1] as WideReceiver;
            } else if (passCatcherStack.passCatchers[1].position === 'TE') {
              te = passCatcherStack.passCatchers[1] as TightEnd;
              wr1 = passCatcherStack.passCatchers[0] as WideReceiver;
            } else {
              wr1 = passCatcherStack.passCatchers[0] as WideReceiver;
              wr2 = passCatcherStack.passCatchers[1] as WideReceiver;
            }
          } else if (passCatcherStack.passCatchers.length === 3) {
            const wrs = passCatcherStack.passCatchers.filter(
              (pc) => pc.position === 'WR'
            ) as WideReceiver[];
            te =
              (passCatcherStack.passCatchers.find(
                (pc) => pc.position === 'TE'
              ) as TightEnd) || null;
            wr1 = wrs[0] || null;
            wr2 = wrs[1] || null;
            wr3 = wrs[2] || null;
          }

          break;
        }

        break;
      }

      let currentCost =
        qb.salary +
        rb1.salary +
        rb2.salary +
        (wr1?.salary || 0) +
        (wr2?.salary || 0) +
        (wr3?.salary || 0) +
        (te?.salary || 0);

      const currentLineup: Lineup = {
        // lineupGroup: qb.id,
        // lineupIndex: i,
        lineupId: `${qb.id}-${i}`,
        lineupGrade: 0,
        qb: { ...qb, qbPassCatcherPairings: [] },
        rb1,
        rb2,
        wr1,
        wr2,
        wr3,
        te,
        flex,
        dst,
        remainingSalary: 50000 - currentCost,
      };

      let restrictedPassCatcherTeams = [
        qb.teamAbbrev,
        qb.opposingTeamAbbrev,
        rb1.teamAbbrev,
        rb2.teamAbbrev,
      ];

      if (!wr1) {
        const costOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers2(
            currentLineup,
            'WR1'
          );
        wr1 = this.findWideReceiverThatFitsBudget(
          currentLineup.remainingSalary,
          restrictedPassCatcherTeams,
          costOfCheapestPossibleRemainingPlayers
        );

        if (wr1) {
          currentLineup.wr1 = wr1;
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - wr1.salary;
          currentCost += wr1.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr1.teamAbbrev,
          ];
        }
      }

      if (!wr2) {
        const costOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers2(
            currentLineup,
            'WR2'
          );
        wr2 = this.findWideReceiverThatFitsBudget(
          currentLineup.remainingSalary,
          restrictedPassCatcherTeams,
          costOfCheapestPossibleRemainingPlayers
        );

        if (wr2) {
          currentLineup.wr2 = wr2;
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - wr2.salary;
          currentCost += wr2.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr2.teamAbbrev,
          ];
        }
      }

      if (!wr3) {
        const costOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers2(
            currentLineup,
            'WR3'
          );
        wr3 = this.findWideReceiverThatFitsBudget(
          currentLineup.remainingSalary,
          restrictedPassCatcherTeams,
          costOfCheapestPossibleRemainingPlayers
        );

        if (wr3) {
          currentLineup.wr3 = wr3;
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - wr3.salary;
          currentCost += wr3.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr3.teamAbbrev,
          ];
        }
      }

      if (!flex) {
        const costOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers2(
            currentLineup,
            'FLEX'
          );
        flex = this.findWideReceiverThatFitsBudget(
          currentLineup.remainingSalary,
          restrictedPassCatcherTeams,
          costOfCheapestPossibleRemainingPlayers
        );

        if (flex) {
          currentLineup.flex = flex;
          // TODO: Use Signal to automatically update the remainingSalary and currentCost
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - flex.salary;
          currentCost += flex.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            flex.teamAbbrev,
          ];
        }
      }

      if (!te) {
        const costOfCheapestPossibleRemainingPlayers =
          this.calculateTotalCostOfCheapestPossibleRemainingPlayers2(
            currentLineup,
            'TE'
          );
        te = this.findTightEndThatFitsBudget(
          currentLineup.remainingSalary,
          restrictedPassCatcherTeams,
          costOfCheapestPossibleRemainingPlayers
        );

        if (te) {
          currentLineup.te = te;
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - te.salary;
          currentCost += te.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            te.teamAbbrev,
          ];
        }
      }

      dst = this.findDstThatFitsBudget(currentLineup);

      if (dst) {
        currentLineup.dst = dst;
        currentLineup.remainingSalary =
          currentLineup.remainingSalary - dst.salary;
        currentCost += dst.salary;
      }

      currentLineup.lineupGrade = this.calculateLineupGrade(currentLineup);

      // lineupsArray.push(currentLineup);
      this.lineups.update((lineups) => [...lineups, currentLineup]);
    }
    // });

    // this.lineups.set(lineupsArray);
  }

  calculateLineupGrade(lineup: Lineup): number {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } = lineup;
    const qbGrade = qb?.gradeOutOfTen || 0;
    const rbGrade = (rb1?.gradeOutOfTen || 0) + (rb2?.gradeOutOfTen || 0);
    const wrGrade =
      (wr1?.gradeOutOfTen || 0) +
      (wr2?.gradeOutOfTen || 0) +
      (wr3?.gradeOutOfTen || 0);
    const teGrade = te?.gradeOutOfTen || 0;
    const flexGrade = flex?.gradeOutOfTen || 0;
    const dstGrade = dst?.gradeOutOfTen || 0;

    return (qbGrade + rbGrade + wrGrade + teGrade + flexGrade + dstGrade) / 90;
  }

  findTightEndThatFitsBudget(
    currentRemainingSalary: number,
    restrictedPassCatcherTeams: string[],
    costOfCheapestPossibleRemainingPlayers: number
  ): TightEnd | null {
    const tightEnd: TightEnd | null =
      this.tePool.find((te) => {
        console.log('tightEnd in loop', {
          currentRemainingSalary,
          te,
          remainingSalaryAfterAddingTeAndCheapestRemainingPlayers:
            currentRemainingSalary -
            te.salary -
            costOfCheapestPossibleRemainingPlayers,
        });

        const remainingSalaryAfterAddingTeAndCheapestRemainingPlayers =
          currentRemainingSalary -
          te.salary -
          costOfCheapestPossibleRemainingPlayers;

        const currentPercentageOfLineupsWithThisPlayer =
          this.wideReceiverDistribution().find(
            (player) => player.playerId === te.id
          )?.percentageOfLineups || 0;

        console.log(
          'remainingSalaryAfterAddingTeAndCheapestRemainingPlayers',
          remainingSalaryAfterAddingTeAndCheapestRemainingPlayers
        );

        // return (
        //   !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
        //   te.salary + currentLineupCost <=
        //     costOfCheapestPossibleRemainingPlayers
        // );
        return (
          !te.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
          !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
          remainingSalaryAfterAddingTeAndCheapestRemainingPlayers >= 0 &&
          currentPercentageOfLineupsWithThisPlayer <= te.maxOwnershipPercentage
        );
      }) || null;

    return tightEnd;
  }

  findWideReceiverThatFitsBudget(
    currentRemainingSalary: number,
    restrictedPassCatcherTeams: string[],
    costOfCheapestPossibleRemainingPlayers: number
  ): WideReceiver | null {
    const wideReceiver: WideReceiver | null =
      this.wrPool.find((wr) => {
        const remainingSalaryAfterAddingWrAndCheapestRemainingPlayers =
          currentRemainingSalary -
          wr.salary -
          costOfCheapestPossibleRemainingPlayers;

        const currentPercentageOfLineupsWithThisPlayer =
          this.wideReceiverDistribution().find(
            (player) => player.playerId === wr.id
          )?.percentageOfLineups || 0;

        // console.log(
        //   `currentPercentageOfLineups for ${wr.name}`,
        //   currentPercentageOfLineups
        // );
        // return (
        //   !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
        //   wr.salary + currentLineupCost <=
        //     costOfCheapestPossibleRemainingPlayers
        // );
        return (
          !wr.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
          !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
          remainingSalaryAfterAddingWrAndCheapestRemainingPlayers >= 0 &&
          currentPercentageOfLineupsWithThisPlayer <= wr.maxOwnershipPercentage
        );
      }) || null;

    return wideReceiver;
  }

  findDstThatFitsBudget(currentLineup: Lineup): Player | null {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, remainingSalary } =
      currentLineup;

    const restrictedDsts = [
      qb?.opposingTeamAbbrev,
      qb?.teamAbbrev,
      rb1?.opposingTeamAbbrev,
      rb2?.opposingTeamAbbrev,
      wr1?.opposingTeamAbbrev,
      wr2?.opposingTeamAbbrev,
      wr3?.opposingTeamAbbrev,
      te?.opposingTeamAbbrev,
      flex?.opposingTeamAbbrev,
    ];

    const dst: Player | null =
      this.dstPool.find(
        (dst) =>
          !restrictedDsts.includes(dst.teamAbbrev) &&
          dst.salary <= remainingSalary
      ) || null;

    return dst;
  }

  generateRbCombos(numbberOfRb1s: number): RunningBack[][] {
    // TODO: Set maxNumberOfLineups value dynamically
    const maxNumberOfLineups = 100;
    const rbCombos = [];
    const rbCombosWithDuplicates: RunningBack[][] = [];
    let numberOfDuplicateRbGroups = 0;

    for (let groupIndex = 0; groupIndex < numbberOfRb1s; groupIndex++) {
      for (let i = groupIndex + 1; i < this.rbPool.length; i++) {
        rbCombos.push([this.rbPool[groupIndex], this.rbPool[i]]);
      }
    }

    numberOfDuplicateRbGroups =
      Math.trunc(maxNumberOfLineups / rbCombos.length) * 2; // * 2 to account for potential incompatible QB/RB combos

    for (let i = 0; i < numberOfDuplicateRbGroups; i++) {
      rbCombosWithDuplicates.push(...rbCombos);
    }

    return rbCombosWithDuplicates;
  }

  generateQbPassCatcherPairings(): void {
    this.qbPool = this.qbPool.map((qb) => {
      const teamsInMatchup = qb.gameInfo.split('@');
      const wrsInThisGame = this.wrPool.filter((wr) =>
        teamsInMatchup.includes(wr.teamAbbrev)
      );
      const tesInThisGame = this.tePool.filter((te) =>
        teamsInMatchup.includes(te.teamAbbrev)
      );
      const passCatcherPool: PassCatcher[] = [
        ...wrsInThisGame,
        ...tesInThisGame,
      ];
      console.log(`passCatcherPool for ${qb.name}`, passCatcherPool);
      const passCatchersForQbsTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev === qb.teamAbbrev
      );
      console.log('passCatchersForQbsTeam', passCatchersForQbsTeam);
      const passCatchersFromOpposingTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev === qb.opposingTeamAbbrev
      );
      console.log('passCatchersFromOpposingTeam', passCatchersFromOpposingTeam);

      const passCatcherCombosWithoutOpponent: PassCatcher[][] = [];
      const passCatcherCombosIncludingOpponent: PassCatcher[][] = [];

      // Begin with pass catchers from QB's team
      for (
        let groupIndex = 0;
        groupIndex < passCatchersForQbsTeam.length;
        groupIndex++
      ) {
        // console.log(
        //   `passCatchersForQbsTeam[${groupIndex}]`,
        //   passCatchersForQbsTeam[groupIndex]
        // );

        if (qb.maxNumberOfTeammatePasscatchers === 1) {
          passCatcherCombosWithoutOpponent.push([
            passCatchersForQbsTeam[groupIndex],
          ]);
        } else {
          for (let i = groupIndex + 1; i < passCatchersForQbsTeam.length; i++) {
            passCatcherCombosWithoutOpponent.push([
              passCatchersForQbsTeam[groupIndex],
              passCatchersForQbsTeam[i],
            ]);
          }
        }
      }

      console.log(
        'passCatcherCombosWithoutOpponent',
        passCatcherCombosWithoutOpponent
      );

      if (qb.requirePassCatcherFromOpposingTeam) {
        for (
          let groupIndex = 0;
          groupIndex < passCatchersFromOpposingTeam.length;
          groupIndex++
        ) {
          for (let i = 0; i < passCatcherCombosWithoutOpponent.length; i++) {
            const doesQbPasscatcherComboIncludeTightEnd =
              passCatcherCombosWithoutOpponent[i].find(
                (pc) => pc.position === 'TE'
              );

            // Don't allow combos with multiple tight ends
            if (
              !doesQbPasscatcherComboIncludeTightEnd ||
              passCatchersFromOpposingTeam[groupIndex].position === 'WR'
            ) {
              passCatcherCombosIncludingOpponent.push([
                ...passCatcherCombosWithoutOpponent[i],
                passCatchersFromOpposingTeam[groupIndex],
              ]);
            }
          }
        }
      }

      console.log(
        'passCatcherCombosIncludingOpponent',
        passCatcherCombosIncludingOpponent
      );

      return {
        ...qb,
        qbPassCatcherPairings: qb.requirePassCatcherFromOpposingTeam
          ? this.addTotalCostAndGradeToQbPassCatcherPairings(
              passCatcherCombosIncludingOpponent
            )
          : this.addTotalCostAndGradeToQbPassCatcherPairings(
              passCatcherCombosWithoutOpponent
            ),
      };
    });
  }

  addTotalCostAndGradeToQbPassCatcherPairings(
    qbPassCatcherPairings: PassCatcher[][]
  ): PassCatcherStack[] {
    return qbPassCatcherPairings.map((passCatchers: PassCatcher[]) => {
      return {
        passCatchers,
        randomizedGrade: 0, // to be calculated later
        // avgGradeOutOfTen:
        //   passCatchers.reduce(
        //     (acc, player) => acc + player.gradeOutOfTen,
        //     0
        //   ) / passCatchers.length,
        totalCostOfThisPassCatcherCombo: passCatchers.reduce(
          (acc, player) => acc + player.salary,
          0
        ),
      };
    });
    // .sort((a, b) => b.avgGradeOutOfTen - a.avgGradeOutOfTen);
  }

  convertLineupsToDraftKingsFormat() {
    return this.lineups().map((lineup) => ({
      'Entry ID': lineup.contestDetails?.entryId || 'abc123',
      'Contest Name': lineup.contestDetails?.contestName || 'xyz123',
      'Contest ID': lineup.contestDetails?.contestId || 'abc567',
      'Entry Fee': lineup.contestDetails?.entryFee || '$50',
      QB: lineup.qb?.id,
      RB1: lineup.rb1?.id,
      RB2: lineup.rb2?.id,
      WR1: lineup.wr1?.id,
      WR2: lineup.wr2?.id,
      WR3: lineup.wr3?.id,
      TE: lineup.te?.id,
      FLEX: lineup.flex?.id,
      DST: lineup.dst?.id,
    }));
  }

  selectedNewQuarterback(qb: Quarterback) {
    // TODO: Save current lineups to DB
    const sortedQbsByGrade = this.qbPool.sort(
      (a, b) => b.gradeOutOfTen - a.gradeOutOfTen
    );
    console.log('sortedQbsByGrade', sortedQbsByGrade);
    const qb1 = sortedQbsByGrade[0];
    const qb2 = sortedQbsByGrade[1];
    const qb3 = sortedQbsByGrade[2];
    const qb4 = sortedQbsByGrade[3];

    if (this.currentQb().id === qb1.id) {
      // TOOD: Save lineups for QB1
      console.log('saving lineups for QB1', this.lineups());
    } else if (this.currentQb().id === qb2.id) {
      // TOOD: Save lineups for QB2
      console.log('saving lineups for QB2', this.lineups());
    } else if (this.currentQb().id === qb3.id) {
      // TOOD: Save lineups for QB3
      console.log('saving lineups for QB3', this.lineups());
    } else if (this.currentQb().id === qb4.id) {
      // TOOD: Save lineups for QB4
      console.log('saving lineups for QB4', this.lineups());
    }

    // TODO: Make sure this happens after saving is complete and successful

    this.currentQb.set(qb);
    this.lineups.set([]);
    this.generateLineups();
  }

  updateLineup(updatedLineup: Lineup) {
    console.log('updatedLineup', updatedLineup);
    // TODO: is it more efficient to use find function?
    const updatedLineups: Lineup[] = this.lineups().map((lineup) => {
      if (
        // lineup.lineupIndex === updatedLineup.lineupIndex &&
        // lineup.lineupGroup === updatedLineup.lineupGroup
        lineup.lineupId === updatedLineup.lineupId
      ) {
        return updatedLineup;
      }

      return lineup;
    });

    this.lineups.set(updatedLineups);
  }

  validateLineups(lineups: Lineup[]): number {
    let numberOfInvalidLineups = 0;
    lineups.forEach((lineup) => {
      const { remainingSalary, qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } =
        lineup;

      if (
        remainingSalary < 0 ||
        remainingSalary > 300 ||
        !qb ||
        !rb1 ||
        !rb2 ||
        !wr1 ||
        !wr2 ||
        !wr3 ||
        !te ||
        !flex ||
        !dst
      ) {
        numberOfInvalidLineups += 1;
      }
    });

    return numberOfInvalidLineups;
  }

  // TODO: Remove?
  outputAsJson() {
    const lineupsArrayJSON = JSON.stringify(
      this.convertLineupsToDraftKingsFormat()
    );

    // TODO: Save this to CSV instead of copying text
    navigator.clipboard.writeText(lineupsArrayJSON);
    console.log(lineupsArrayJSON);
  }

  saveLineups() {
    // TODO: Save lineups to DB
    console.log('Saving lineups to DB...', this.lineups());
  }
}
