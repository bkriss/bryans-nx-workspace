// TODO: Add validation that forces the max ownership percentages to total 100% for each QB
// TODO: Consider refactoring this compomnent and/or child component once Signal Forms are available
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  PassCatcher,
  PlayerSelectionStore,
} from '@bryans-nx-workspace/draftkings-shared';
import { PassCatcherOwnershipComponent } from '../pass-catcher-ownership/pass-catcher-ownership.component';

@Component({
  selector: 'dfs-qb-pass-catcher-ownership',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PassCatcherOwnershipComponent,
  ],
  templateUrl: './qb-pass-catcher-ownership.component.html',
  styleUrl: './qb-pass-catcher-ownership.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QbPassCatcherOwnershipComponent {
  private readonly playerSelectionStore = inject(PlayerSelectionStore);

  selectedQuarterbacks = this.playerSelectionStore.quarterbacks;
  selectedWideReceivers = this.playerSelectionStore.wideReceivers;
  selectedTightEnds = this.playerSelectionStore.tightEnds;
  hasOwnershipCalculationBeenRun: WritableSignal<boolean> = signal(false);

  qbTeams = computed(() =>
    this.selectedQuarterbacks().map((qb) => qb.teamAbbrev)
  );
  selectedPassCatchers = computed(() =>
    [...this.selectedWideReceivers(), ...this.selectedTightEnds()]
      .filter(
        (passCatcher) =>
          this.qbTeams().includes(passCatcher.teamAbbrev) ||
          this.qbTeams().includes(passCatcher.opposingTeamAbbrev)
      )
      .sort((a, b) => b.gradeOutOfTen - a.gradeOutOfTen)
  );

  quarterbackStacks = computed(() =>
    this.selectedQuarterbacks().map((qb) => {
      const teammatePassCatchers = this.selectedPassCatchers().filter(
        (pc) => pc.teamAbbrev === qb.teamAbbrev
      );
      const opposingPassCatchers = this.selectedPassCatchers().filter(
        (pc) => pc.teamAbbrev === qb.opposingTeamAbbrev
      );

      return {
        qb,
        teammatePassCatchers,
        opposingPassCatchers,
      };
    })
  );

  constructor() {
    effect(() => {
      if (
        !this.hasOwnershipCalculationBeenRun() &&
        this.playerSelectionStore.allPoolsAreSet()
      ) {
        this.hasOwnershipCalculationBeenRun.set(true);
        this.setOwnershipForPassCatchersWithOrAgainstQb();
      }
    });
  }

  calculateOwnershipPercentagesForGivenPassCatcher(
    passCatcher: PassCatcher,
    relevantQbPassCatcherData: {
      qbTeamAbbrev: string;
      qbOpposingTeamAbbrev: string;
      numberOfTeammatePassCatchersPerLineup: number;
      requirePlayerFromOpposingTeam: boolean;
      opponentPassCatchers: PassCatcher[];
      teammatePassCatchers: PassCatcher[];
    }
  ): PassCatcher {
    // TODO: Consider refactoring this function so that it is more readable and easier to understand
    const defaultOpponentPassCatcherDistributions = [
      [0], // no pass catchers to choose from
      [100], // one pass catcher to choose from
      [70, 30], // two pass catchers to choose from
      [65, 27, 8], // three pass catchers to choose from
      [60, 27, 8, 5], // four pass catchers to choose from
      [58, 28, 8, 3, 3], // five pass catchers to choose from
      [57, 28, 8, 3, 3, 1], // six pass catchers to choose from
    ];
    const defaultTeammatePassCatcherDistributionsWhenMaxIsOne = [
      [0],
      [100],
      [70, 30],
      [65, 27, 8],
      [60, 27, 8, 5],
      [58, 28, 8, 3, 3],
      [57, 28, 8, 3, 3, 1],
    ];
    const defaultTeammatePassCatcherDistributionsWhenMaxIsTwo = [
      [0],
      [100],
      [100, 100],
      [90, 85, 25],
      [85, 80, 25, 10],
      [84, 78, 25, 10, 3],
      [83, 78, 25, 10, 3, 1],
    ];

    // Teammate pass catchers
    const numberOfAvailableTeammatePassCatchers =
      relevantQbPassCatcherData?.teammatePassCatchers?.length || 0;
    const teammatePassCatcherIndex =
      relevantQbPassCatcherData.teammatePassCatchers.findIndex(
        (tpc) => tpc.id === passCatcher.id
      );

    const maxOwnershipWhenPairedWithQb: number =
      relevantQbPassCatcherData.numberOfTeammatePassCatchersPerLineup === 1
        ? defaultTeammatePassCatcherDistributionsWhenMaxIsOne[
            numberOfAvailableTeammatePassCatchers
          ][teammatePassCatcherIndex] || 0
        : defaultTeammatePassCatcherDistributionsWhenMaxIsTwo[
            numberOfAvailableTeammatePassCatchers
          ][teammatePassCatcherIndex] || 0;
    const minOwnershipWhenPairedWithQb =
      maxOwnershipWhenPairedWithQb < 8 ? 0 : maxOwnershipWhenPairedWithQb - 8;

    // Opposing team pass catchers
    const numberOfAvailableOpposingPassCatchers =
      relevantQbPassCatcherData?.opponentPassCatchers?.length || 0;
    const opponentPassCatcherIndex =
      relevantQbPassCatcherData.opponentPassCatchers.findIndex(
        (opc) => opc.id === passCatcher.id
      );
    let maxOwnershipWhenPairedWithOpposingQb: number =
      passCatcher.maxOwnershipPercentage;
    let minOwnershipWhenPairedWithOpposingQb: number =
      passCatcher.minOwnershipPercentage;

    if (relevantQbPassCatcherData.requirePlayerFromOpposingTeam) {
      maxOwnershipWhenPairedWithOpposingQb =
        defaultOpponentPassCatcherDistributions[
          numberOfAvailableOpposingPassCatchers
        ][opponentPassCatcherIndex] || 0;
      minOwnershipWhenPairedWithOpposingQb =
        maxOwnershipWhenPairedWithOpposingQb < 8
          ? 0
          : maxOwnershipWhenPairedWithOpposingQb - 8;
    }

    return {
      ...passCatcher,
      maxOwnershipWhenPairedWithOpposingQb,
      minOwnershipWhenPairedWithOpposingQb,
      maxOwnershipWhenPairedWithQb,
      minOwnershipWhenPairedWithQb,
    };
  }

  setOwnershipForPassCatchersWithOrAgainstQb(): void {
    const havePassCatchersAlreadyBeenUpdated = this.selectedPassCatchers().some(
      (pc) =>
        (pc.maxOwnershipWhenPairedWithQb &&
          pc.maxOwnershipWhenPairedWithQb > 0) ||
        (pc.minOwnershipWhenPairedWithQb &&
          pc.minOwnershipWhenPairedWithQb > 0) ||
        (pc.maxOwnershipWhenPairedWithOpposingQb &&
          pc.maxOwnershipWhenPairedWithOpposingQb > 0) ||
        (pc.minOwnershipWhenPairedWithOpposingQb &&
          pc.minOwnershipWhenPairedWithOpposingQb > 0)
    );

    if (havePassCatchersAlreadyBeenUpdated) return;

    const allPassCatchers = [
      ...this.selectedWideReceivers(),
      ...this.selectedTightEnds(),
    ];
    const qbPassCatcherData = this.selectedQuarterbacks().map((qb) => {
      return {
        qbTeamAbbrev: qb.teamAbbrev,
        qbOpposingTeamAbbrev: qb.opposingTeamAbbrev,
        numberOfTeammatePassCatchersPerLineup:
          qb.maxNumberOfTeammatePasscatchers,
        requirePlayerFromOpposingTeam: qb.requirePlayerFromOpposingTeam,
        opponentPassCatchers: allPassCatchers
          .filter((pc) => pc.teamAbbrev === qb.opposingTeamAbbrev)
          .sort((a, b) => b.gradeOutOfTen - a.gradeOutOfTen),
        teammatePassCatchers: allPassCatchers
          .filter((pc) => pc.teamAbbrev === qb.teamAbbrev)
          .sort((a, b) => b.gradeOutOfTen - a.gradeOutOfTen),
      };
    });

    const updatedWrPool = this.selectedWideReceivers().map((wr) => {
      const relevantQbPassCatcherData = qbPassCatcherData.find(
        (data) =>
          data.qbTeamAbbrev === wr.teamAbbrev ||
          data.qbOpposingTeamAbbrev === wr.teamAbbrev
      );

      if (relevantQbPassCatcherData) {
        return this.calculateOwnershipPercentagesForGivenPassCatcher(
          wr,
          relevantQbPassCatcherData
        );
      }

      return wr;
    });

    const updatedTePool = this.selectedTightEnds().map((te) => {
      const relevantQbPassCatcherData = qbPassCatcherData.find(
        (data) =>
          data.qbTeamAbbrev === te.teamAbbrev ||
          data.qbOpposingTeamAbbrev === te.teamAbbrev
      );

      if (relevantQbPassCatcherData) {
        return this.calculateOwnershipPercentagesForGivenPassCatcher(
          te,
          relevantQbPassCatcherData
        );
      }

      return te;
    });

    this.playerSelectionStore.setWideReceivers(updatedWrPool);
    this.playerSelectionStore.setTightEnds(updatedTePool);
  }

  savePassCatchers(): void {
    const updatedWideReceivers = this.selectedWideReceivers().map((wr) => {
      const updatedWideReceiver = this.selectedPassCatchers().find(
        (selectedPassCatcher) => selectedPassCatcher.id === wr.id
      );
      return updatedWideReceiver ? updatedWideReceiver : wr;
    });

    const updatedTightEnds = this.selectedTightEnds().map((te) => {
      const updatedTightEnd = this.selectedPassCatchers().find(
        (selectedPassCatcher) => selectedPassCatcher.id === te.id
      );
      return updatedTightEnd ? updatedTightEnd : te;
    });

    this.playerSelectionStore.setWideReceivers(updatedWideReceivers);
    this.playerSelectionStore.setTightEnds(updatedTightEnds);
    this.playerSelectionStore.saveSelectedPlayersToFirestore('PassCatchers');
  }
}
