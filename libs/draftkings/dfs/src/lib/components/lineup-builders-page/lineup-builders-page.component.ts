import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Lineup,
  PassCatcher,
  PassCatcherStack,
  Player,
  Position,
  Quarterback,
  RunningBack,
  SimpleLineup,
  SimplePlayer,
  LineupsStore,
  PlayerSelectionStore,
  SlatesStore,
  Flex,
} from '@bryans-nx-workspace/draftkings-shared';
import { LineupsComponent } from '../lineups/lineups.component';

@Component({
  imports: [CommonModule, LineupsComponent],
  templateUrl: './lineup-builders-page.component.html',
  styleUrl: './lineup-builders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuildersPageComponent {
  private readonly lineupsStore = inject(LineupsStore);
  private readonly playerSelectionStore = inject(PlayerSelectionStore);
  private readonly slatesStore = inject(SlatesStore);
  readonly isSmallSlate = this.slatesStore.isSmallSlate;
  readonly loadingLineups = this.lineupsStore.isLoading;
  readonly loadingPlayerPools = this.playerSelectionStore.isLoading;
  readonly loadingSlates = this.slatesStore.isLoading;
  readonly qbPool = this.playerSelectionStore.quarterbacks;
  readonly rbPool = this.playerSelectionStore.runningBacks;
  readonly wrPool = this.playerSelectionStore.wideReceivers;
  readonly tePool = this.playerSelectionStore.tightEnds;
  readonly dstPool = this.playerSelectionStore.defenses;
  beganLineupGeneration: WritableSignal<boolean> = signal(false);
  currentQb: WritableSignal<Quarterback> = signal({} as Quarterback);
  isLoading = computed(
    () =>
      this.loadingSlates() || this.loadingPlayerPools() || this.loadingLineups()
  );
  lineups: WritableSignal<Lineup[]> = signal([]);
  loadedPlayers: WritableSignal<boolean> = signal(false);
  maxRemainingSalary = computed(() => (this.isSmallSlate() ? 600 : 300));
  numberOfInvalidLineups: Signal<number> = computed(() =>
    this.validateLineups(this.lineups())
  );
  playerSelectionsLoaded = signal(false);
  totalSalary = 50000;

  constructor() {
    effect(() => {
      const loadingSlateData = this.slatesStore.isLoading();
      const currentSlate = this.slatesStore.currentSlate();

      // When loading completes and we have a valid slate, load player pools
      if (!loadingSlateData && currentSlate && !this.playerSelectionsLoaded()) {
        this.playerSelectionsLoaded.set(true);
        this.playerSelectionStore.loadSelectedPlayersFromFirestore();
      }
    });

    effect(() => {
      if (
        this.playerSelectionStore.allPoolsAreSet() &&
        !this.beganLineupGeneration()
      ) {
        this.beganLineupGeneration.set(true);
        // setTimeout(() => {
        this.generateQbPassCatcherStacks();
        this.generateLineups();
        // }, 0);
      }
    });
  }

  randomlySortTopWideReceivers(
    eligibleWideReceivers: PassCatcher[]
  ): PassCatcher[] {
    const sortedByGrade = [...eligibleWideReceivers].sort(
      (a, b) => b.gradeOutOfTen - a.gradeOutOfTen
    );
    const topTenWrs = sortedByGrade.slice(0, 10);
    const remainingWrs = sortedByGrade.slice(10);

    // Randomize top players to reduce excessive overlap, but leave the rest in original order so the higher-graded WRs are still prioritized
    return [...topTenWrs.sort(() => Math.random() - 0.5), ...remainingWrs];
  }

  findEligibleWideReceiversForLineup(
    restrictedPassCatcherTeams: string[],
    fillingFlexPosition = false
  ): PassCatcher[] {
    const eligibleWideReceivers = this.wrPool().filter((wr) => {
      const currentNumberOfLineupsWithThisWr = this.lineups().filter(
        (lineup) =>
          lineup.wr1?.id === wr.id ||
          lineup.wr2?.id === wr.id ||
          lineup.wr3?.id === wr.id ||
          lineup.flex?.id === wr.id
      ).length;

      const maxOwnershipPercentage =
        wr.teamAbbrev === this.currentQb().teamAbbrev
          ? wr.maxOwnershipWhenPairedWithQb
          : wr.teamAbbrev === this.currentQb().opposingTeamAbbrev
          ? wr.maxOwnershipWhenPairedWithOpposingQb
          : wr.maxOwnershipPercentage;

      const maxNumberAllowed = Math.ceil(
        ((maxOwnershipPercentage || 0) / 100) *
          this.currentQb().numberOfLineupsWithThisPlayer
      );

      return (
        !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
        !wr.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
        currentNumberOfLineupsWithThisWr < maxNumberAllowed
      );
    });

    return fillingFlexPosition
      ? eligibleWideReceivers.sort((a, b) => b.salary - a.salary)
      : this.randomlySortTopWideReceivers(eligibleWideReceivers);
  }

  findEligibleTightEndsForLineup(
    restrictedPassCatcherTeams: string[]
  ): PassCatcher[] {
    return this.tePool()
      .filter((te) => {
        const currentNumberOfLineupsWithThisTe = this.lineups().filter(
          (lineup) => lineup.te?.id === te.id || lineup.flex?.id === te.id
        ).length;

        const maxOwnershipPercentage =
          te.teamAbbrev === this.currentQb().teamAbbrev
            ? te.maxOwnershipWhenPairedWithQb
            : te.teamAbbrev === this.currentQb().opposingTeamAbbrev
            ? te.maxOwnershipWhenPairedWithOpposingQb
            : te.maxOwnershipPercentage;

        const maxNumberAllowed = Math.ceil(
          ((maxOwnershipPercentage || 0) / 100) *
            this.currentQb().numberOfLineupsWithThisPlayer
        );

        return (
          !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
          !te.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
          currentNumberOfLineupsWithThisTe < maxNumberAllowed
        );
      })
      .sort((a, b) => b.gradeOutOfTen - a.gradeOutOfTen);
  }

  findEligibleDstsForLineup(
    currentLineup: Lineup,
    playerToAdd?: Flex
  ): Player[] {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex } = currentLineup;
    const restrictedDsts: string[] = [];

    // TODO: Add logic for small slates

    if (qb) {
      restrictedDsts.push(qb.opposingTeamAbbrev);
      restrictedDsts.push(qb.teamAbbrev);
    }

    if (rb1) {
      // Teams can have defense and RB from same team
      restrictedDsts.push(rb1.opposingTeamAbbrev);
    }

    if (rb2) {
      // Teams can have defense and RB from same team
      restrictedDsts.push(rb2.opposingTeamAbbrev);
    }

    if (wr1) {
      restrictedDsts.push(wr1.opposingTeamAbbrev);
      restrictedDsts.push(wr1.teamAbbrev);
    }

    if (wr2) {
      restrictedDsts.push(wr2.opposingTeamAbbrev);
      restrictedDsts.push(wr2.teamAbbrev);
    }

    if (wr3) {
      restrictedDsts.push(wr3.opposingTeamAbbrev);
      restrictedDsts.push(wr3.teamAbbrev);
    }

    if (te) {
      restrictedDsts.push(te.opposingTeamAbbrev);
      restrictedDsts.push(te.teamAbbrev);
    }

    if (flex) {
      restrictedDsts.push(flex.opposingTeamAbbrev);
      restrictedDsts.push(flex.teamAbbrev);
    }

    if (playerToAdd) {
      restrictedDsts.push(playerToAdd.opposingTeamAbbrev);

      if (playerToAdd.position !== Position.RB) {
        restrictedDsts.push(playerToAdd.teamAbbrev);
      }
    }

    const eligibleDsts = this.dstPool().filter((dst) => {
      const currentNumberOfLineupsWithThisDst = this.lineups().filter(
        (lineup) => lineup.dst?.id === dst.id
      ).length;
      const maxNumber = Math.ceil(
        (dst.maxOwnershipPercentage / 100) *
          this.currentQb().numberOfLineupsWithThisPlayer
      );

      return (
        !restrictedDsts.includes(dst.teamAbbrev) &&
        currentNumberOfLineupsWithThisDst < maxNumber
      );
    });

    return eligibleDsts;
  }

  checkIfRestOfRosterIsAffordableIfThisFlexIsAdded(
    currentLineup: Lineup,
    flexToAdd: Flex
  ): boolean {
    const { remainingSalary } = currentLineup;

    const eligibleDsts = this.findEligibleDstsForLineup(
      currentLineup,
      flexToAdd
    );
    const dstsSortedBySalary = [...eligibleDsts].sort(
      (a, b) => a.salary - b.salary
    );
    const costOfCheapestDst = dstsSortedBySalary?.[0]?.salary || 2500;
    const costOfAffordableDst: number =
      eligibleDsts.find((dst) => {
        const totalCostIfThisDstIsUsed = flexToAdd.salary + dst.salary;

        const finalRemainingSalaryIfThisDstisUsed =
          remainingSalary - totalCostIfThisDstIsUsed;

        return (
          finalRemainingSalaryIfThisDstisUsed >= 0 &&
          finalRemainingSalaryIfThisDstisUsed <= this.maxRemainingSalary()
        );
      })?.salary || costOfCheapestDst;

    const finalRemainingSalary =
      remainingSalary - (flexToAdd.salary + costOfAffordableDst);

    return (
      finalRemainingSalary >= 0 &&
      finalRemainingSalary <= this.maxRemainingSalary()
    );
  }

  checkIfRestOfRosterIsAffordableIfThisPassCatcherIsAdded(
    currentLineup: Lineup,
    passCatcherToAdd: PassCatcher,
    eligibleWideReceivers: PassCatcher[],
    eligibleTightEnds: PassCatcher[]
  ): boolean {
    const { wr1, wr2, wr3, te, flex, dst, remainingSalary } = currentLineup;

    const eligibleDsts = this.findEligibleDstsForLineup(
      currentLineup,
      passCatcherToAdd
    );

    // Sort defenses by salary ascending to get cost of cheapest DST first
    const dstsSortedBySalary = [...eligibleDsts].sort(
      (a, b) => a.salary - b.salary
    );
    const wrsSortedBySalary = [...eligibleWideReceivers].sort(
      (a, b) => a.salary - b.salary
    );
    const tesSortedBySalary = [...eligibleTightEnds].sort(
      (a, b) => a.salary - b.salary
    );

    const costOfCheapestTe = tesSortedBySalary?.[0]?.salary || 3000;
    let numberOfMissingWideReceiversAfterAddingThisPlayer = 0;

    const costOfCheapestWr = wrsSortedBySalary?.[0]?.salary || 3000;
    const costOfSecondCheapestWr = wrsSortedBySalary?.[1]?.salary || 3200;
    const costOfThirdCheapestWr = wrsSortedBySalary?.[2]?.salary || 3500;
    const costOfFourthCheapestWr = wrsSortedBySalary?.[3]?.salary || 3700;
    const costOfCheapestDst = dstsSortedBySalary?.[0]?.salary || 2500;
    const costOfMostExpensiveDst =
      dstsSortedBySalary[dstsSortedBySalary.length - 1]?.salary || 3800;

    if (!wr1) {
      numberOfMissingWideReceiversAfterAddingThisPlayer += 1;
    }
    if (!wr2) {
      numberOfMissingWideReceiversAfterAddingThisPlayer += 1;
    }
    if (!wr3) {
      numberOfMissingWideReceiversAfterAddingThisPlayer += 1;
    }
    if (!flex) {
      numberOfMissingWideReceiversAfterAddingThisPlayer += 1;
    }

    let costOfThisPlayerAndEstimatedCostOfRemainingPlayers =
      passCatcherToAdd.salary;

    if (passCatcherToAdd.position === Position.WR) {
      // If passCatcherToAdd is a WR, we don't need to account for it in the remaining players
      numberOfMissingWideReceiversAfterAddingThisPlayer -= 1;
    }

    if (!te && passCatcherToAdd.position !== Position.TE) {
      costOfThisPlayerAndEstimatedCostOfRemainingPlayers += costOfCheapestTe;
    }

    if (numberOfMissingWideReceiversAfterAddingThisPlayer >= 1) {
      costOfThisPlayerAndEstimatedCostOfRemainingPlayers += costOfCheapestWr;
    }

    if (numberOfMissingWideReceiversAfterAddingThisPlayer >= 2) {
      costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
        costOfSecondCheapestWr;
    }

    if (numberOfMissingWideReceiversAfterAddingThisPlayer >= 3) {
      costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
        costOfThirdCheapestWr;
    }

    if (numberOfMissingWideReceiversAfterAddingThisPlayer === 4) {
      costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
        costOfFourthCheapestWr;
    }

    if (!dst) {
      if (numberOfMissingWideReceiversAfterAddingThisPlayer === 0) {
        // Find DST that fits within remaining salary after accounting for cost of this player and estimated cost of remaining players
        const costOfAffordableDst: number =
          eligibleDsts.find((dst) => {
            const totalCostIfThisDstIsUsed =
              costOfThisPlayerAndEstimatedCostOfRemainingPlayers + dst.salary;

            const finalRemainingSalaryIfThisDstisUsed =
              remainingSalary - totalCostIfThisDstIsUsed;

            return (
              finalRemainingSalaryIfThisDstisUsed >= 0 &&
              finalRemainingSalaryIfThisDstisUsed <= this.maxRemainingSalary()
            );
          })?.salary || costOfCheapestDst;

        costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
          costOfAffordableDst;

        // costOfThisPlayerAndEstimatedCostOfRemainingPlayers += costOfCheapestDst;
        // const indexOfRandomDst = Math.floor(
        //   Math.random() * eligibleDsts.length
        // );

        // costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
        //   eligibleDsts[indexOfRandomDst].salary;
      } else {
        // Adding cost of most expensive DST to provide more flexibility with WR options during next selection
        costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
          costOfMostExpensiveDst;

        // costOfThisPlayerAndEstimatedCostOfRemainingPlayers +=
        //   dstsSortedBySalary[Math.floor(dstsSortedBySalary.length / 2)].salary;

        // costOfThisPlayerAndEstimatedCostOfRemainingPlayers += costOfCheapestDst;
      }
    }

    const finalRemainingSalary =
      remainingSalary - costOfThisPlayerAndEstimatedCostOfRemainingPlayers;

    // Last position (FLEX)
    if (numberOfMissingWideReceiversAfterAddingThisPlayer === 0) {
      return (
        finalRemainingSalary >= 0 &&
        finalRemainingSalary <= this.maxRemainingSalary()
      );
    }

    // TODO: Should this include maxRemainingSalary check?
    return finalRemainingSalary >= 0;
  }

  calculateEstimatedCostOfRemainingPlayers(
    passCatcherCombo: PassCatcher[],
    qb: Quarterback,
    rb1: RunningBack,
    rb2: RunningBack
  ): number {
    let estimatedCostOfRemainingPlayers = 0;
    const wideReceiversInPassCatcherCombo = passCatcherCombo.filter(
      (player) => player.position === Position.WR
    );
    const tightEndsInPassCatcherCombo = passCatcherCombo.filter(
      (player) => player.position === Position.TE
    );
    const numberOfTightEndsInCombo = tightEndsInPassCatcherCombo.length;
    const numberOfWideReceiversInCombo = wideReceiversInPassCatcherCombo.length;

    let restrictedPassCatcherTeams: string[] = [];
    if (!this.isSmallSlate()) {
      // Not allowing new pass catchers to be on QB team because we've already added QB stacks at this point
      restrictedPassCatcherTeams = [
        qb.teamAbbrev,
        rb1.teamAbbrev,
        rb2.teamAbbrev,
      ];

      if (qb.requirePlayerFromOpposingTeam) {
        restrictedPassCatcherTeams.push(qb.opposingTeamAbbrev);
      }
    }

    const eligibleWideReceivers = this.wrPool().filter(
      (wr) =>
        !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
        !wr.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb
    );
    const eligibleTightEnds = this.tePool().filter(
      (te) =>
        !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
        !te.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb
    );

    const currentlyEligibleDsts = this.findEligibleDstsForLineup({
      qb,
      rb1,
      rb2,
      wr1: wideReceiversInPassCatcherCombo[0] ?? null,
      wr2: wideReceiversInPassCatcherCombo[1] ?? null,
      wr3: wideReceiversInPassCatcherCombo[2] ?? null,
      te: tightEndsInPassCatcherCombo[0] ?? null,
    } as Lineup);

    const dstsSortedBySalary = currentlyEligibleDsts.sort(
      (a, b) => a.salary - b.salary
    );
    const wrsSortedBySalary = [...eligibleWideReceivers].sort(
      (a, b) => a.salary - b.salary
    );
    const tesSortedBySalary = [...eligibleTightEnds].sort(
      (a, b) => a.salary - b.salary
    );

    // const numberOfDsts = this.dstPool.length;
    // const numberOfEligibleWrs = eligibleWideReceivers.length;

    // const medianDstIndex = Math.floor(numberOfDsts / 2);
    // const medianWrIndex = Math.floor(numberOfEligibleWrs / 2);

    // const medianCostOfDst = dstsSortedBySalary[medianDstIndex].salary;
    // const medianCostOfWr = wrsSortedBySalary[medianWrIndex].salary;
    const costOfCheapestWr = wrsSortedBySalary[0].salary;
    const costOfSecondCheapestWr = wrsSortedBySalary[1].salary;
    const costOfThirdCheapestWr = wrsSortedBySalary[2].salary;
    const costOfFourthCheapestWr = wrsSortedBySalary[3].salary;
    const costOfCheapestTe = tesSortedBySalary[0].salary;
    const costOfMostExpensiveDst =
      dstsSortedBySalary[dstsSortedBySalary.length - 1].salary;

    if (numberOfTightEndsInCombo === 0) {
      estimatedCostOfRemainingPlayers += costOfCheapestTe;
    }

    if (numberOfWideReceiversInCombo === 0) {
      // estimatedCostOfRemainingPlayers += costOfCheapestWr + medianCostOfWr * 3;
      estimatedCostOfRemainingPlayers +=
        costOfCheapestWr +
        costOfSecondCheapestWr +
        costOfThirdCheapestWr +
        costOfFourthCheapestWr;
    }
    if (numberOfWideReceiversInCombo === 1) {
      estimatedCostOfRemainingPlayers +=
        costOfCheapestWr + costOfSecondCheapestWr + costOfThirdCheapestWr;
    }
    if (numberOfWideReceiversInCombo === 2) {
      estimatedCostOfRemainingPlayers +=
        costOfCheapestWr + costOfSecondCheapestWr;
    }
    if (numberOfWideReceiversInCombo === 3) {
      estimatedCostOfRemainingPlayers += costOfCheapestWr;
    }

    estimatedCostOfRemainingPlayers += costOfMostExpensiveDst;

    return estimatedCostOfRemainingPlayers;
  }

  // TODO: Add logic to increase probability of certain players being in certain lineups (like game stacks that don't involve lineup's QB)
  generateLineups(): void {
    const rbCombosWithDuplicates = this.generateRbCombos(4);
    const qb = this.currentQb();
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
      let wr1: PassCatcher | null = null;
      let wr2: PassCatcher | null = null;
      let wr3: PassCatcher | null = null;
      let te: PassCatcher | null = null;
      let flex: Flex | null = null;
      let dst: Player | null = null;

      let passCatcherStacksAccountingForPlayerLimits =
        this.generateQbPassCatcherStacksAccountingForPlayerLimits(qb);

      if (!this.isSmallSlate()) {
        // Exclude pass catcher stacks that include players from the RBs' teams
        passCatcherStacksAccountingForPlayerLimits =
          passCatcherStacksAccountingForPlayerLimits.filter((stack) => {
            const passCatcherTeamAbbrevs = stack.passCatchers.map(
              (pc) => pc.teamAbbrev
            );

            return (
              !passCatcherTeamAbbrevs.includes(rb1.teamAbbrev) &&
              !passCatcherTeamAbbrevs.includes(rb2.teamAbbrev)
            );
          });
      }

      // randomly sort the stacks to reduce excessive overlap from one lineup to the next
      const randomlySortedQbPassCatcherStacks =
        passCatcherStacksAccountingForPlayerLimits.sort(
          () => Math.random() - 0.5
        );

      for (const passCatcherStack of randomlySortedQbPassCatcherStacks) {
        const totalCostOfQbRbComboAndThisPassCatcherCombo =
          qb.salary +
          totalRbComboSalary +
          passCatcherStack.totalCostOfThisPassCatcherCombo;

        const remainingSalaryIfThisStackIsUsed =
          this.totalSalary - totalCostOfQbRbComboAndThisPassCatcherCombo;

        const estimatedCostOfRemainingPlayers =
          this.calculateEstimatedCostOfRemainingPlayers(
            passCatcherStack.passCatchers,
            qb,
            rb1,
            rb2
          );

        if (
          remainingSalaryIfThisStackIsUsed >= estimatedCostOfRemainingPlayers
        ) {
          const wrsFromPassCatcherStack = passCatcherStack.passCatchers.filter(
            (pc) => pc.position === 'WR'
          ) as PassCatcher[];
          te =
            passCatcherStack.passCatchers.find((pc) => pc.position === 'TE') ||
            null;

          if (wrsFromPassCatcherStack.length > 0) {
            wr1 = wrsFromPassCatcherStack[0] as PassCatcher;
          }
          if (wrsFromPassCatcherStack.length > 1) {
            wr2 = wrsFromPassCatcherStack[1] as PassCatcher;
          }
          if (wrsFromPassCatcherStack.length > 2) {
            wr3 = wrsFromPassCatcherStack[2] as PassCatcher;
          }

          break;
        }
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
        lineupId: `${qb.id}-${i}`,
        lineupGrade: 0, // Will be calculated later
        lineupScore: 0, // Will be calculated later
        qb: { ...qb, passCatcherStacks: [] },
        rb1,
        rb2,
        wr1,
        wr2,
        wr3,
        te,
        flex,
        dst,
        remainingSalary: this.totalSalary - currentCost,
        totalProjectedPoints: 0, // Will be calculated later
      };

      let restrictedPassCatcherTeams: string[] = [];
      if (!this.isSmallSlate()) {
        // Not allowing new pass catchers to be on QB team because we've already added QB stacks at this point
        restrictedPassCatcherTeams = [
          qb.teamAbbrev,
          rb1.teamAbbrev,
          rb2.teamAbbrev,
        ];

        if (qb.requirePlayerFromOpposingTeam) {
          restrictedPassCatcherTeams.push(qb.opposingTeamAbbrev);
        }
      }

      if (!wr1) {
        wr1 = this.findWideReceiverThatFitsBudget(
          currentLineup,
          restrictedPassCatcherTeams
        );

        if (wr1) {
          currentLineup.wr1 = wr1;
          currentLineup.remainingSalary -= wr1.salary;
          currentCost += wr1.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr1.teamAbbrev,
          ];
        }
      }

      if (!wr2) {
        wr2 = this.findWideReceiverThatFitsBudget(
          currentLineup,
          restrictedPassCatcherTeams
        );

        if (wr2) {
          currentLineup.wr2 = wr2;
          currentLineup.remainingSalary -= wr2.salary;
          currentCost += wr2.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr2.teamAbbrev,
          ];
        }
      }

      if (!wr3) {
        wr3 = this.findWideReceiverThatFitsBudget(
          currentLineup,
          restrictedPassCatcherTeams
        );

        if (wr3) {
          currentLineup.wr3 = wr3;
          currentLineup.remainingSalary -= wr3.salary;
          currentCost += wr3.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            wr3.teamAbbrev,
          ];
        }
      }

      if (!te) {
        te = this.findTightEndThatFitsBudget(
          currentLineup,
          restrictedPassCatcherTeams
        );

        if (te) {
          currentLineup.te = te;
          currentLineup.remainingSalary -= te.salary;
          currentCost += te.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            te.teamAbbrev,
          ];
        }
      }

      if (!flex) {
        flex = this.findFlexThatFitsBudget(
          currentLineup,
          restrictedPassCatcherTeams
        );

        if (flex) {
          currentLineup.flex = flex;
          currentLineup.remainingSalary -= flex.salary;
          currentCost += flex.salary;
          restrictedPassCatcherTeams = [
            ...restrictedPassCatcherTeams,
            flex.teamAbbrev,
          ];
        }
      }

      if (qb && rb1 && rb2 && wr1 && wr2 && wr3 && te && flex && !dst) {
        dst = this.findDstThatFitsBudget(currentLineup);
      }

      if (dst) {
        currentLineup.dst = dst;
        currentLineup.remainingSalary -= dst.salary;
        currentCost += dst.salary;
      }

      const lineupGrade = this.calculateLineupGrade(currentLineup);
      const totalProjectedPoints =
        this.calculateTotalProjectedPoints(currentLineup);
      const lineupScore = lineupGrade + totalProjectedPoints;
      currentLineup.lineupGrade = lineupGrade;
      currentLineup.totalProjectedPoints = totalProjectedPoints;
      currentLineup.lineupScore = lineupScore;
      this.lineups.update((lineups) => [...lineups, currentLineup]);
    }
  }

  generateQbPassCatcherStacksAccountingForPlayerLimits(
    qb: Quarterback
  ): PassCatcherStack[] {
    return qb.passCatcherStacks.filter((stack) => {
      const numberOfLineupsWithThisQb = qb.numberOfLineupsWithThisPlayer;
      let currentNumberOfLineupsWithThisPassCatcher = 0;

      const foundPlayerThatisOverLimit = stack.passCatchers.some((pc) => {
        if (pc.position === 'WR') {
          currentNumberOfLineupsWithThisPassCatcher = this.lineups().filter(
            (lineup) =>
              lineup.wr1?.id === pc.id ||
              lineup.wr2?.id === pc.id ||
              lineup.wr3?.id === pc.id ||
              lineup.flex?.id === pc.id
          ).length;
        } else {
          currentNumberOfLineupsWithThisPassCatcher = this.lineups().filter(
            (lineup) => lineup.te?.id === pc.id || lineup.flex?.id === pc.id
          ).length;
        }

        const pairedWithQb = pc.teamAbbrev === qb.teamAbbrev;

        const maxNumberOfLineupsWithThisPassCatcher = Math.ceil(
          pairedWithQb
            ? numberOfLineupsWithThisQb *
                ((pc.maxOwnershipWhenPairedWithQb || 0) / 100)
            : numberOfLineupsWithThisQb *
                ((pc.maxOwnershipWhenPairedWithOpposingQb || 0) / 100)
        );

        return (
          currentNumberOfLineupsWithThisPassCatcher >=
          maxNumberOfLineupsWithThisPassCatcher
        );
      });
      return !foundPlayerThatisOverLimit;
    });
  }

  convertToSimplePlayer(player: Player): SimplePlayer {
    return {
      id: player.id,
      nameAbbrev: player.nameAbbrev,
      name: player.name,
      onlyUseInLargerFieldContests: Boolean(
        player.onlyUseInLargerFieldContests
      ),
    };
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

    const combinedGrade =
      qbGrade + rbGrade + wrGrade + teGrade + flexGrade + dstGrade;

    return Number(((combinedGrade / 90) * 100).toFixed(3));
  }

  calculateTotalProjectedPoints(lineup: Lineup): number {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } = lineup;
    const totalProjectedPoints =
      (qb?.projectedPointsAvg || 0) +
      (rb1?.projectedPointsAvg || 0) +
      (rb2?.projectedPointsAvg || 0) +
      (wr1?.projectedPointsAvg || 0) +
      (wr2?.projectedPointsAvg || 0) +
      (wr3?.projectedPointsAvg || 0) +
      (te?.projectedPointsAvg || 0) +
      (flex?.projectedPointsAvg || 0) +
      (dst?.projectedPointsAvg || 0);

    return Number(totalProjectedPoints.toFixed(3));
  }

  findTightEndThatFitsBudget(
    currentLineup: Lineup,
    restrictedPassCatcherTeams: string[]
  ): PassCatcher | null {
    const eligibleTightEnds = this.findEligibleTightEndsForLineup(
      restrictedPassCatcherTeams
    );
    const eligibleWideReceivers = this.findEligibleWideReceiversForLineup(
      restrictedPassCatcherTeams
    );

    const tightEnd: PassCatcher | null =
      eligibleTightEnds.find((te) => {
        const willThisBeAffordable =
          this.checkIfRestOfRosterIsAffordableIfThisPassCatcherIsAdded(
            currentLineup,
            te,
            eligibleWideReceivers,
            eligibleTightEnds
          );

        return (
          !te.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
          !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
          willThisBeAffordable === true
        );
      }) || null;

    return tightEnd;
  }

  // TODO: Check if there is repeat code that can be replaced with this function
  calculateMaxNumberOfLineupsWithThisPassCatcher(
    passCatcher: PassCatcher
  ): number {
    let maxOwnershipPercentage = 0;
    if (passCatcher.teamAbbrev === this.currentQb().teamAbbrev) {
      maxOwnershipPercentage = passCatcher.maxOwnershipWhenPairedWithQb || 0;
    } else if (passCatcher.teamAbbrev === this.currentQb().opposingTeamAbbrev) {
      maxOwnershipPercentage =
        passCatcher.maxOwnershipWhenPairedWithOpposingQb || 0;
    } else {
      maxOwnershipPercentage = passCatcher.maxOwnershipPercentage;
    }

    return Math.ceil(
      this.currentQb().numberOfLineupsWithThisPlayer *
        (maxOwnershipPercentage / 100)
    );
  }

  findFlexThatFitsBudget(
    currentLineup: Lineup,
    restrictedTeams: string[]
  ): Flex | null {
    const eligibleRunningBacks = this.rbPool()
      .filter((rb) => rb.allowOnlyAsFlex || rb.useAsAlternate)
      .filter((rb) => {
        const currentNumberOfLineupsWithThisRb = this.lineups().filter(
          (lineup) =>
            lineup.rb1?.id === rb.id ||
            lineup.rb2?.id === rb.id ||
            lineup.flex?.id === rb.id
        ).length;

        const maxNumberAllowed = Math.ceil(
          (rb.maxOwnershipPercentage / 100) *
            this.currentQb().numberOfLineupsWithThisPlayer
        );

        // TODO: Add logic for small slates that allows RBs from same team as QB in flex

        return (
          !restrictedTeams.includes(rb.teamAbbrev) &&
          currentNumberOfLineupsWithThisRb < maxNumberAllowed
        );
      });

    const eligibleWideReceivers = this.findEligibleWideReceiversForLineup(
      restrictedTeams,
      true
    );
    const eligibleTightEnds = this.findEligibleTightEndsForLineup(
      restrictedTeams
    ).filter(
      (te) => te.projectedPointsAvg >= 8 && te.projectedPointsPerDollar >= 0.225
    );

    // Not sorting after combining positions so that RBs are prioritized.
    const flex: Flex | null =
      [
        ...eligibleRunningBacks,
        ...eligibleWideReceivers,
        ...eligibleTightEnds,
      ].find((player) => {
        const willThisBeAffordable =
          this.checkIfRestOfRosterIsAffordableIfThisFlexIsAdded(
            currentLineup,
            player
          );

        return willThisBeAffordable;
      }) || null;

    return flex;
  }

  findWideReceiverThatFitsBudget(
    currentLineup: Lineup,
    restrictedPassCatcherTeams: string[],
    fillingFlexPosition = false
  ): PassCatcher | null {
    const eligibleTightEnds = this.findEligibleTightEndsForLineup(
      restrictedPassCatcherTeams
    );
    const eligibleWideReceivers = this.findEligibleWideReceiversForLineup(
      restrictedPassCatcherTeams,
      fillingFlexPosition
    );

    const wideReceiver: PassCatcher | null =
      eligibleWideReceivers.find((wr) => {
        const willThisBeAffordable =
          this.checkIfRestOfRosterIsAffordableIfThisPassCatcherIsAdded(
            currentLineup,
            wr,
            eligibleWideReceivers,
            eligibleTightEnds
          );

        return (
          willThisBeAffordable &&
          !wr.onlyUseIfPartOfStackOrPlayingWithOrAgainstQb &&
          !restrictedPassCatcherTeams.includes(wr.teamAbbrev)
        );
      }) || null;

    return wideReceiver;
  }

  findDstThatFitsBudget(currentLineup: Lineup): Player | null {
    const { remainingSalary } = currentLineup;

    const eligibleDsts = this.findEligibleDstsForLineup(currentLineup);

    const defense: Player | null =
      eligibleDsts
        .sort((a, b) => b.gradeOutOfTen - a.gradeOutOfTen)
        .find(
          (dst) =>
            dst.salary <= remainingSalary &&
            remainingSalary - dst.salary <= this.maxRemainingSalary()
        ) || null;

    // TODO: If small slate, map dsts and reduce grade for defenses that have a player in the lineup, then re-sort by grade to reduce chance they're selected
    return defense;
  }

  generateRbCombos(numberOfRb1s: number): RunningBack[][] {
    // TODO: Set maxNumberOfLineups value dynamically
    const maxNumberOfLineups = 50;
    const rbCombos = [];
    const rbCombosWithDuplicates: RunningBack[][] = [];
    let numberOfDuplicateRbGroups = 0;

    const qbPlaysOnSameTeamAsOneOfTheRbs = this.rbPool().some(
      (rb) => rb.teamAbbrev === this.currentQb().teamAbbrev
    );

    let rbPool: RunningBack[] = this.rbPool().filter(
      (rb) =>
        !rb.allowOnlyAsFlex && rb.teamAbbrev !== this.currentQb().teamAbbrev
    );

    if (!qbPlaysOnSameTeamAsOneOfTheRbs) {
      rbPool = rbPool.filter((rb) => !rb.useAsAlternate);
    }

    rbPool.sort((a, b) => b.maxOwnershipPercentage - a.maxOwnershipPercentage);

    for (let groupIndex = 0; groupIndex < numberOfRb1s; groupIndex++) {
      for (let i = groupIndex + 1; i < rbPool.length; i++) {
        rbCombos.push([rbPool[groupIndex], rbPool[i]]);
      }
    }

    numberOfDuplicateRbGroups =
      Math.trunc(maxNumberOfLineups / rbCombos.length) * 2; // * 2 to account for potential incompatible QB/RB combos

    for (let i = 0; i < numberOfDuplicateRbGroups; i++) {
      rbCombosWithDuplicates.push(...rbCombos);
    }

    return rbCombosWithDuplicates;
  }

  generateQbPassCatcherStacks(): void {
    console.log('Generating QB pass catcher stacks...');
    const updatedQbs = this.qbPool().map((qb) => {
      const teamsInMatchup = qb.gameInfo.split('@');
      const wrsInThisGame = this.wrPool().filter((wr) =>
        teamsInMatchup.includes(wr.teamAbbrev)
      );
      const tesInThisGame = this.tePool().filter((te) =>
        teamsInMatchup.includes(te.teamAbbrev)
      );
      const passCatcherPool: PassCatcher[] = [
        ...wrsInThisGame,
        ...tesInThisGame,
      ];
      const passCatchersForQbsTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev === qb.teamAbbrev
      );
      const passCatchersFromOpposingTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev === qb.opposingTeamAbbrev
      );

      const passCatcherCombosWithoutOpponent: PassCatcher[][] = [];
      const passCatcherCombosIncludingOpponent: PassCatcher[][] = [];

      // Begin with pass catchers from QB's team
      for (
        let groupIndex = 0;
        groupIndex < passCatchersForQbsTeam.length;
        groupIndex++
      ) {
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

      if (qb.requirePlayerFromOpposingTeam) {
        for (
          let groupIndex = 0;
          groupIndex < passCatchersFromOpposingTeam.length;
          groupIndex++
        ) {
          for (let i = 0; i < passCatcherCombosWithoutOpponent.length; i++) {
            const doesQbPasscatcherComboIncludeTightEnd =
              passCatcherCombosWithoutOpponent[i].find(
                (pc) => pc.position === Position.TE
              );

            // Don't allow combos with multiple tight ends
            if (
              !doesQbPasscatcherComboIncludeTightEnd ||
              passCatchersFromOpposingTeam[groupIndex].position === Position.WR
            ) {
              passCatcherCombosIncludingOpponent.push([
                ...passCatcherCombosWithoutOpponent[i],
                passCatchersFromOpposingTeam[groupIndex],
              ]);
            }
          }
        }
      }

      const stacks = qb.requirePlayerFromOpposingTeam
        ? passCatcherCombosIncludingOpponent
        : passCatcherCombosWithoutOpponent;

      const passCatcherStacks: PassCatcherStack[] = stacks.map(
        (passCatchers: PassCatcher[]) => {
          return {
            passCatchers,
            totalCostOfThisPassCatcherCombo: passCatchers.reduce(
              (acc, player) => acc + player.salary,
              0
            ),
          };
        }
      );

      return {
        ...qb,
        passCatcherStacks,
      };
    });

    // Update the quarterbacks in the store with the new pass catcher stacks
    this.playerSelectionStore.setQuarterbacks(updatedQbs);

    // Make sure currentQb has updated passCatcherStacks
    this.currentQb.set(this.qbPool()[0]);
  }

  selectedNewQuarterback(quarterback: Quarterback) {
    // this.saveLineups();

    // TODO: Make sure this happens after saveLineups() is complete and successful
    this.currentQb.set(quarterback);
    this.lineups.set([]);
    this.generateLineups();
  }

  updateLineup(updatedLineup: Lineup) {
    // TODO: is it more efficient to use find function?
    const updatedLineups: Lineup[] = this.lineups().map((lineup) => {
      if (lineup.lineupId === updatedLineup.lineupId) {
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
        remainingSalary > this.maxRemainingSalary() ||
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

  simplifyLineupData(): SimpleLineup[] {
    return this.lineups().map((lineup) => {
      const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } = lineup;

      if (!qb || !rb1 || !rb2 || !wr1 || !wr2 || !wr3 || !te || !flex || !dst) {
        return {
          contestDetails: lineup.contestDetails || null,
          lineupId: lineup.lineupId,
          lineupGrade: 0,
          lineupScore: 0,
          totalProjectedPoints: 0,
          qb: null,
          rb1: null,
          rb2: null,
          wr1: null,
          wr2: null,
          wr3: null,
          te: null,
          flex: null,
          dst: null,
        } as SimpleLineup;
      }

      return {
        contestDetails: lineup.contestDetails || null,
        lineupId: lineup.lineupId,
        lineupGrade: lineup.lineupGrade,
        lineupScore: lineup.lineupScore,
        totalProjectedPoints: lineup.totalProjectedPoints,
        qb: this.convertToSimplePlayer(qb),
        rb1: this.convertToSimplePlayer(rb1),
        rb2: this.convertToSimplePlayer(rb2),
        wr1: this.convertToSimplePlayer(wr1),
        wr2: this.convertToSimplePlayer(wr2),
        wr3: this.convertToSimplePlayer(wr3),
        te: this.convertToSimplePlayer(te),
        flex: this.convertToSimplePlayer(flex),
        dst: this.convertToSimplePlayer(dst),
      } as SimpleLineup;
    });
  }

  saveLineups() {
    const { sortOrder } = this.currentQb();

    const lineupsToSave: SimpleLineup[] = this.simplifyLineupData();
    if (sortOrder === 1) {
      console.log('saving lineups for QB1', lineupsToSave);
      this.lineupsStore.setLineupsForQb1(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb1: lineupsToSave,
      });
    } else if (sortOrder === 2) {
      console.log('saving lineups for QB2', lineupsToSave);
      this.lineupsStore.setLineupsForQb2(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb2: lineupsToSave,
      });
    } else if (sortOrder === 3) {
      console.log('saving lineups for QB3', lineupsToSave);
      this.lineupsStore.setLineupsForQb3(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb3: lineupsToSave,
      });
    } else if (sortOrder === 4) {
      console.log('saving lineups for QB4', lineupsToSave);
      this.lineupsStore.setLineupsForQb4(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb4: lineupsToSave,
      });
    } else if (sortOrder === 5) {
      console.log('saving lineups for QB5', lineupsToSave);
      this.lineupsStore.setLineupsForQb5(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb5: lineupsToSave,
      });
    } else if (sortOrder === 6) {
      console.log('saving lineups for QB6', lineupsToSave);
      this.lineupsStore.setLineupsForQb6(lineupsToSave);
      this.lineupsStore.saveLineupsToFirestore({
        lineupsForQb6: lineupsToSave,
      });
    } else {
      console.error(`Unknown sortOrder for quarterback: ${sortOrder}`);
    }
  }
}
