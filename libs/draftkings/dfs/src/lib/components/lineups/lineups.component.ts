import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  Lineup,
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
} from '@bryans-nx-workspace/draftkings-shared';
import { PlayerOverlapImbalanceButtonComponent } from '../player-overlap-imbalance-button/player-overlap-imbalance-button.component';
import { PlayerDistributionsComponent } from '../player-distributions/player-distributions.component';
import { LineupBuilderComponent } from '../lineup-builder/lineup-builder.component';
import { SelectSlateComponent } from '../select-slate/select-slate.component';
import { LineupValidationModalComponent } from '../lineup-validation-modal/lineup-validation-modal.component';

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
    SelectSlateComponent,
  ],
  templateUrl: './lineups.component.html',
  styleUrl: './lineups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupsComponent {
  @Input() currentQb: Signal<Quarterback> = signal({} as Quarterback);
  @Input() isSmallSlate = false;
  @Input() lineups: Signal<Lineup[]> = signal([]);
  @Input() maxRemainingSalary = 300;
  @Input() qbPool: Quarterback[] = [];
  @Input() rbPool: RunningBack[] = [];
  @Input() wrPool: PassCatcher[] = [];
  @Input() tePool: PassCatcher[] = [];
  @Input() dstPool: Player[] = [];
  @Output() saveLineups = new EventEmitter<void>();
  @Output() updateLineup = new EventEmitter<Lineup>();
  @Output() selectedNewQuarterback = new EventEmitter<Quarterback>();
  readonly dialog = inject(MatDialog);
  errorMessages: WritableSignal<string[]> = signal([]);

  validateLineups(): void {
    this.errorMessages.set([]);
    this.lineups().forEach((lineup, index) => {
      const isLineupComplete = this.checkIfLineupIsComplete(lineup, index);

      if (isLineupComplete) {
        // Only necessary to check salary if lineup is complete
        this.checkIfTotalSalaryIsInvalid(lineup, index);
      }

      this.checkIfTooManyPassCatchersFromSameTeam(lineup, index);

      this.checkIfAnyPlayersOnSameTeamAsDst(lineup, index);
    });

    if (this.errorMessages().length > 0) {
      this.errorMessages().forEach((msg) => console.error(msg));
    } else {
      console.log('All lineups are valid!');
    }
    this.openValidationModal(this.errorMessages());
  }

  checkIfLineupIsComplete(lineup: Lineup, index: number): boolean {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } = lineup;

    const lineupFilled = Boolean(
      qb?.id &&
        rb1?.id &&
        rb2?.id &&
        wr1?.id &&
        wr2?.id &&
        wr3?.id &&
        te?.id &&
        flex?.id &&
        dst?.id
    );

    if (!lineupFilled) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} is incomplete.`,
      ]);
    }

    return lineupFilled;
  }

  checkIfTotalSalaryIsInvalid(lineup: Lineup, index: number): void {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, dst } = lineup;
    const totalSalary =
      (qb?.salary || 0) +
      (rb1?.salary || 0) +
      (rb2?.salary || 0) +
      (wr1?.salary || 0) +
      (wr2?.salary || 0) +
      (wr3?.salary || 0) +
      (te?.salary || 0) +
      (flex?.salary || 0) +
      (dst?.salary || 0);

    if (totalSalary > 50000) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} exceeds salary cap.`,
      ]);
    }

    const lowestTotalSalaryAllowed = 50000 - this.maxRemainingSalary;

    if (totalSalary < lowestTotalSalaryAllowed) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} is too far under salary cap.`,
      ]);
    }
  }

  checkIfTooManyPassCatchersFromSameTeam(lineup: Lineup, index: number): void {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex } = lineup;
    const teamCountForQbsPassCatchers: { [teamAbbrev: string]: number } = {};
    const teamCountForPlayersNotOnQbsTeam: { [teamAbbrev: string]: number } =
      {};

    if (rb1) {
      teamCountForPlayersNotOnQbsTeam[rb1.teamAbbrev] =
        (teamCountForPlayersNotOnQbsTeam[rb1.teamAbbrev] || 0) + 1;
    }

    if (rb2) {
      teamCountForPlayersNotOnQbsTeam[rb2.teamAbbrev] =
        (teamCountForPlayersNotOnQbsTeam[rb2.teamAbbrev] || 0) + 1;
    }

    [wr1, wr2, wr3, te, flex].forEach((player) => {
      if (player && player.teamAbbrev === qb?.teamAbbrev) {
        teamCountForQbsPassCatchers[player.teamAbbrev] =
          (teamCountForQbsPassCatchers[player.teamAbbrev] || 0) + 1;
      }

      if (player && player.teamAbbrev !== qb?.teamAbbrev) {
        teamCountForPlayersNotOnQbsTeam[player.teamAbbrev] =
          (teamCountForPlayersNotOnQbsTeam[player.teamAbbrev] || 0) + 1;
      }
    });

    const numberOfPassCatchersAllowedNotFromQbMatchup = this.isSmallSlate
      ? 2
      : 1;

    const tooManyFromSameTeam = Object.values(teamCountForQbsPassCatchers).some(
      (count) => count > (qb?.maxNumberOfTeammatePasscatchers || 0)
    );
    const tooManyFromOtherTeams = Object.values(
      teamCountForPlayersNotOnQbsTeam
    ).some((count) => count > numberOfPassCatchersAllowedNotFromQbMatchup);

    if (tooManyFromSameTeam) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} has too many pass catchers from QB's team`,
      ]);
    }

    if (tooManyFromOtherTeams) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} has too many players from the same team`,
      ]);
    }
  }

  checkIfAnyPlayersOnSameTeamAsDst(lineup: Lineup, index: number): void {
    if (this.isSmallSlate) return;
    const { qb, wr1, wr2, wr3, te, flex, dst } = lineup;

    // Not checking for RBs since it's okay for them to be paired with their DST
    const playersOnDstTeam = [qb, wr1, wr2, wr3, te, flex].filter(
      (player) => player && dst && player.teamAbbrev === dst.teamAbbrev
    );

    if (playersOnDstTeam.length > 0) {
      this.errorMessages.update((messages) => [
        ...messages,
        `Lineup ${index + 1} has players on the same team as the DST`,
      ]);
    }
  }

  openValidationModal(errorMessages: string[]): void {
    this.dialog.open(LineupValidationModalComponent, {
      data: { errorMessages },
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   if (result !== undefined) {
    //     this.animal.set(result);
    //   }
    // });
  }
}
