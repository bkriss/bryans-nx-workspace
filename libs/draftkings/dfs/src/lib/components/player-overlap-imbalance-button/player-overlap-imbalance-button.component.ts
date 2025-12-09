import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  Lineup,
  PassCatcher,
  Player,
  PlayerOverlapReview,
  Position,
  RunningBack,
} from '@bryans-nx-workspace/draftkings-shared';
import { MatDialog } from '@angular/material/dialog';
import { PlayerOverlapImbalanceModalComponent } from '../player-overlap-imbalance-modal/player-overlap-imbalance-modal.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dfs-player-overlap-imbalance-button',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './player-overlap-imbalance-button.component.html',
  styleUrl: './player-overlap-imbalance-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerOverlapImbalanceButtonComponent {
  // @Input() lineups: Signal<Lineup[]> = signal([]);
  @Input() lineups: Lineup[] = [];
  @Input() rbPool: RunningBack[] = [];
  @Input() wrPool: PassCatcher[] = [];
  @Input() tePool: PassCatcher[] = [];
  @Input() dstPool: Player[] = [];
  readonly dialog = inject(MatDialog);

  checkForPlayerOverlapImbalances() {
    const playerOverlapReview: PlayerOverlapReview[] = [];
    // const numberOfRbsToReview = 7;
    // const numberOfWRsToReview = 15;
    // const numberOfTEsToReview = 5;
    // const numberOfDSTsToReview = 5;

    const sortedWrPool = [...this.wrPool].sort(
      (a, b) => b.maxOwnershipPercentage - a.maxOwnershipPercentage
    );

    // WR review
    for (let wrLoopIndex = 0; wrLoopIndex < 10; wrLoopIndex++) {
      playerOverlapReview.push({
        name: sortedWrPool[wrLoopIndex].name,
        playerId: sortedWrPool[wrLoopIndex].id,
        position: Position.WR,
        rbsInLineupsWithThisPlayer: [],
        wrsInLineupsWithThisPlayer: [],
        tesInLineupsWithThisPlayer: [],
        dstsInLineupsWithThisPlayer: [],
      });

      const lineupsWithCurrentWrToReview = this.findAllLineupsWithPlayer(
        this.lineups,
        sortedWrPool[wrLoopIndex].id
      );

      const eligibleRbs = this.rbPool.filter(
        (rb) => rb.teamAbbrev !== this.lineups[0].qb?.teamAbbrev
      );

      // # of instances with RBs
      for (
        let rbLoopIndex = 0;
        rbLoopIndex < eligibleRbs.length;
        rbLoopIndex++
      ) {
        const lineupsWithWrAndThisRb = this.findAllLineupsWithPlayer(
          lineupsWithCurrentWrToReview,
          eligibleRbs[rbLoopIndex].id,
          Position.RB
        );
        const percentageOfLineupsWithThisPlayer =
          lineupsWithWrAndThisRb.length / lineupsWithCurrentWrToReview.length;

        if (
          percentageOfLineupsWithThisPlayer === 0 ||
          percentageOfLineupsWithThisPlayer > 0.5
        ) {
          playerOverlapReview[wrLoopIndex].rbsInLineupsWithThisPlayer.push({
            name: eligibleRbs[rbLoopIndex].name,
            numberOfLineupsWithThisPlayer: lineupsWithWrAndThisRb.length,
            percentageOfLineupsWithThisPlayer:
              lineupsWithWrAndThisRb.length /
              lineupsWithCurrentWrToReview.length,
            playerId: eligibleRbs[rbLoopIndex].id,
          });
        }
      }

      // # of instances with WRs
      for (
        let innerWrLoopIndex = wrLoopIndex + 1;
        innerWrLoopIndex < 10;
        innerWrLoopIndex++
      ) {
        const lineupsWithTheseTwoWrs = this.findAllLineupsWithPlayer(
          lineupsWithCurrentWrToReview,
          sortedWrPool[innerWrLoopIndex].id,
          Position.WR
        );
        const percentageOfLineupsWithThisPlayer =
          lineupsWithTheseTwoWrs.length / lineupsWithCurrentWrToReview.length;

        if (
          percentageOfLineupsWithThisPlayer === 0 ||
          percentageOfLineupsWithThisPlayer > 0.5
        ) {
          playerOverlapReview[wrLoopIndex].wrsInLineupsWithThisPlayer.push({
            name: sortedWrPool[innerWrLoopIndex].name,
            numberOfLineupsWithThisPlayer: lineupsWithTheseTwoWrs.length,
            percentageOfLineupsWithThisPlayer:
              lineupsWithTheseTwoWrs.length /
              lineupsWithCurrentWrToReview.length,
            playerId: sortedWrPool[innerWrLoopIndex].id,
          });
        }
      }

      // # of instances with TEs
      for (let teLoopIndex = 0; teLoopIndex < 5; teLoopIndex++) {
        const lineupsWithWrAndThisTe = this.findAllLineupsWithPlayer(
          lineupsWithCurrentWrToReview,
          this.tePool[teLoopIndex].id,
          Position.TE
        );
        const percentageOfLineupsWithThisPlayer =
          lineupsWithWrAndThisTe.length / lineupsWithCurrentWrToReview.length;

        if (
          percentageOfLineupsWithThisPlayer === 0 ||
          percentageOfLineupsWithThisPlayer > 0.5
        ) {
          playerOverlapReview[wrLoopIndex].tesInLineupsWithThisPlayer.push({
            name: this.tePool[teLoopIndex].name,
            numberOfLineupsWithThisPlayer: lineupsWithWrAndThisTe.length,
            percentageOfLineupsWithThisPlayer:
              lineupsWithWrAndThisTe.length /
              lineupsWithCurrentWrToReview.length,
            playerId: this.tePool[teLoopIndex].id,
          });
        }
      }
      // const numberOfLineupsWithRb1 = this.findAllLineupsWithPlayer(
      //   lineupsWithCurrentWrToReview,
      //   eligibleRbs[0].id,
      //   Position.RB
      // );
    }

    console.log('playerOverlapReview', playerOverlapReview);
    this.openDialog(playerOverlapReview);
  }

  findAllLineupsWithPlayer(
    lineups: Lineup[],
    playerId: string,
    position: Position = Position.WR
  ): Lineup[] {
    if (position === Position.RB) {
      return lineups.filter(
        (lineup) =>
          lineup.rb1?.id === playerId ||
          lineup.rb2?.id === playerId ||
          lineup.flex?.id === playerId
      );
    }

    if (position === Position.TE) {
      return lineups.filter(
        (lineup) => lineup.te?.id === playerId || lineup.flex?.id === playerId
      );
    }

    return lineups.filter(
      (lineup) =>
        lineup.wr1?.id === playerId ||
        lineup.wr2?.id === playerId ||
        lineup.wr3?.id === playerId ||
        lineup.flex?.id === playerId
    );
  }

  openDialog(playerOverlapReview: PlayerOverlapReview[]): void {
    this.dialog.open(PlayerOverlapImbalanceModalComponent, {
      data: { playerOverlapReview },
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   if (result !== undefined) {
    //     this.animal.set(result);
    //   }
    // });
  }
}
