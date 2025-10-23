import {
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
  selectedQuarterbacks,
  selectedRunningBacks,
} from '../../utils/selected-players.util';

@Component({
  imports: [
    CommonModule,
    LineupBuilderComponent,
    MatButtonModule, // TODO: Remove
    MatIconModule,
    MatExpansionModule,
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
  wrPool: WideReceiver[] = [
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 9,
      id: '40470280',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Courtland Sutton',
      nameAbbrev: 'C. Sutton',
      opposingTeamAbbrev: 'DAL',
      position: 'WR',
      salary: 6200,
      teamAbbrev: 'DEN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'MIA@ATL',
      gradeOutOfTen: 8.9,
      id: '40470276',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Drake London',
      nameAbbrev: 'D. London',
      opposingTeamAbbrev: 'MIA',
      position: 'WR',
      salary: 6400,
      teamAbbrev: 'ATL',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CHI@BAL',
      gradeOutOfTen: 8.8,
      id: '40470278',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Rome Odunze',
      nameAbbrev: 'R. Odunze',
      opposingTeamAbbrev: 'BAL',
      position: 'WR',
      salary: 6300,
      teamAbbrev: 'CHI',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'BUF@CAR',
      gradeOutOfTen: 8.7,
      id: '40470292',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Tetairoa McMillan',
      nameAbbrev: 'T. McMillan',
      opposingTeamAbbrev: 'BUF',
      position: 'WR',
      salary: 5700,
      teamAbbrev: 'CAR',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 8.6,
      id: '40470272',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Emeka Egbuka',
      nameAbbrev: 'E. Egbuka',
      opposingTeamAbbrev: 'NO',
      position: 'WR',
      salary: 7000,
      teamAbbrev: 'TB',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 8.5,
      id: '40470290',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Chris Olave',
      nameAbbrev: 'C. Olave',
      opposingTeamAbbrev: 'TB',
      position: 'WR',
      salary: 5800,
      teamAbbrev: 'NO',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 8.4,
      id: '40470266',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'CeeDee Lamb',
      nameAbbrev: 'C. Lamb',
      opposingTeamAbbrev: 'DEN',
      position: 'WR',
      salary: 7800,
      teamAbbrev: 'DAL',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 8.3,
      id: '40470270',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'George Pickens',
      nameAbbrev: 'G. Pickens',
      opposingTeamAbbrev: 'DEN',
      position: 'WR',
      salary: 7100,
      teamAbbrev: 'DAL',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYG@PHI',
      gradeOutOfTen: 8.2,
      id: '40470282',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'A.J. Brown',
      nameAbbrev: 'A. Brown',
      opposingTeamAbbrev: 'NYG',
      position: 'WR',
      salary: 6100,
      teamAbbrev: 'PHI',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CLE@NE',
      gradeOutOfTen: 8.1,
      id: '40470288',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Stefon Diggs',
      nameAbbrev: 'S. Diggs',
      opposingTeamAbbrev: 'CLE',
      position: 'WR',
      salary: 5800,
      teamAbbrev: 'NE',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'MIA@ATL',
      gradeOutOfTen: 8,
      id: '40470294',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Jaylen Waddle',
      nameAbbrev: 'J. Waddle',
      opposingTeamAbbrev: 'ATL',
      position: 'WR',
      salary: 5700,
      teamAbbrev: 'MIA',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 7.9,
      id: '40470296',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Tee Higgins',
      nameAbbrev: 'T. Higgins',
      opposingTeamAbbrev: 'NYJ',
      position: 'WR',
      salary: 5600,
      teamAbbrev: 'CIN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 7.8,
      id: '40470336',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Tez Johnson',
      nameAbbrev: 'T. Johnson',
      opposingTeamAbbrev: 'NO',
      position: 'WR',
      salary: 4300,
      teamAbbrev: 'TB',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TEN@IND',
      gradeOutOfTen: 7.7,
      id: '40470298',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Michael Pittman Jr.',
      nameAbbrev: 'M. Pittman Jr.',
      opposingTeamAbbrev: 'TEN',
      position: 'WR',
      salary: 5600,
      teamAbbrev: 'IND',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CHI@BAL',
      gradeOutOfTen: 7.6,
      id: '40470302',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Zay Flowers',
      nameAbbrev: 'Z. Flowers',
      opposingTeamAbbrev: 'CHI',
      position: 'WR',
      salary: 5400,
      teamAbbrev: 'BAL',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYG@PHI',
      gradeOutOfTen: 7.5,
      id: '40470308',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: "Wan'Dale Robinson",
      nameAbbrev: 'W. Robinson',
      opposingTeamAbbrev: 'PHI',
      position: 'WR',
      salary: 5200,
      teamAbbrev: 'NYG',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'BUF@CAR',
      gradeOutOfTen: 7.4,
      id: '40470310',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Khalil Shakir',
      nameAbbrev: 'K. Shakir',
      opposingTeamAbbrev: 'CAR',
      position: 'WR',
      salary: 5100,
      teamAbbrev: 'BUF',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 7.3,
      id: '40470324',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Rashid Shaheed',
      nameAbbrev: 'R. Shaheed',
      opposingTeamAbbrev: 'TB',
      position: 'WR',
      salary: 4700,
      teamAbbrev: 'NO',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'MIA@ATL',
      gradeOutOfTen: 7.2,
      id: '40470332',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Darnell Mooney',
      nameAbbrev: 'D. Mooney',
      opposingTeamAbbrev: 'MIA',
      position: 'WR',
      salary: 4400,
      teamAbbrev: 'ATL',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CLE@NE',
      gradeOutOfTen: 7.1,
      id: '40470320',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Kayshon Boutte',
      nameAbbrev: 'K. Boutte',
      opposingTeamAbbrev: 'CLE',
      position: 'WR',
      salary: 4800,
      teamAbbrev: 'NE',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 7,
      id: '40470330',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Sterling Shepard',
      nameAbbrev: 'S. Shepard',
      opposingTeamAbbrev: 'NO',
      position: 'WR',
      salary: 4500,
      teamAbbrev: 'TB',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 6.9,
      id: '40470264',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: "Ja'Marr Chase",
      nameAbbrev: 'J. Chase',
      opposingTeamAbbrev: 'NYJ',
      position: 'WR',
      salary: 8100,
      teamAbbrev: 'CIN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 6.8,
      id: '40470338',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Troy Franklin',
      nameAbbrev: 'T. Franklin',
      opposingTeamAbbrev: 'DAL',
      position: 'WR',
      salary: 4200,
      teamAbbrev: 'DEN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CLE@NE',
      gradeOutOfTen: 6.7,
      id: '40470342',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Jerry Jeudy',
      nameAbbrev: 'J. Jeudy',
      opposingTeamAbbrev: 'NE',
      position: 'WR',
      salary: 4100,
      teamAbbrev: 'CLE',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SF@HOU',
      gradeOutOfTen: 6.6,
      id: '40470380',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Jaylin Noel',
      nameAbbrev: 'J. Noel',
      opposingTeamAbbrev: 'SF',
      position: 'WR',
      salary: 3500,
      teamAbbrev: 'HOU',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 6.5,
      id: '40470354',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Marvin Mims Jr.',
      nameAbbrev: 'M. Mims Jr.',
      opposingTeamAbbrev: 'DAL',
      position: 'WR',
      salary: 3900,
      teamAbbrev: 'DEN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TEN@IND',
      gradeOutOfTen: 6.4,
      id: '40470356',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Elic Ayomanor',
      nameAbbrev: 'E. Ayomanor',
      opposingTeamAbbrev: 'IND',
      position: 'WR',
      salary: 3900,
      teamAbbrev: 'TEN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'BUF@CAR',
      gradeOutOfTen: 6.3,
      id: '40470358',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Jalen Coker',
      nameAbbrev: 'J. Coker',
      opposingTeamAbbrev: 'BUF',
      position: 'WR',
      salary: 3800,
      teamAbbrev: 'CAR',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
  ];
  tePool: TightEnd[] = [
    {
      gameInfo: 'CLE@NE',
      gradeOutOfTen: 9,
      id: '40470662',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Harold Fannin Jr.',
      nameAbbrev: 'H. Fannin Jr.',
      opposingTeamAbbrev: 'NE',
      position: 'TE',
      salary: 4400,
      teamAbbrev: 'CLE',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 8.9,
      id: '40470680',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Mason Taylor',
      nameAbbrev: 'M. Taylor',
      opposingTeamAbbrev: 'CIN',
      position: 'TE',
      salary: 3500,
      teamAbbrev: 'NYJ',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 8.8,
      id: '40470690',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Noah Fant',
      nameAbbrev: 'N. Fant',
      opposingTeamAbbrev: 'NYJ',
      position: 'TE',
      salary: 3200,
      teamAbbrev: 'CIN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TEN@IND',
      gradeOutOfTen: 8.7,
      id: '40470658',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Tyler Warren',
      nameAbbrev: 'T. Warren',
      opposingTeamAbbrev: 'TEN',
      position: 'TE',
      salary: 5500,
      teamAbbrev: 'IND',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TB@NO',
      gradeOutOfTen: 8.6,
      id: '40470684',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Cade Otton',
      nameAbbrev: 'C. Otton',
      opposingTeamAbbrev: 'NO',
      position: 'TE',
      salary: 3400,
      teamAbbrev: 'TB',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CHI@BAL',
      gradeOutOfTen: 8.5,
      id: '40470698',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Colston Loveland',
      nameAbbrev: 'C. Loveland',
      opposingTeamAbbrev: 'BAL',
      position: 'TE',
      salary: 3000,
      teamAbbrev: 'CHI',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SF@HOU',
      gradeOutOfTen: 8.4,
      id: '40470660',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'George Kittle',
      nameAbbrev: 'G. Kittle',
      opposingTeamAbbrev: 'HOU',
      position: 'TE',
      salary: 4500,
      teamAbbrev: 'SF',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@DEN',
      gradeOutOfTen: 8.3,
      id: '40470668',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      name: 'Evan Engram',
      nameAbbrev: 'E. Engram',
      opposingTeamAbbrev: 'DAL',
      position: 'TE',
      salary: 4100,
      teamAbbrev: 'DEN',
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
  ];
  dstPool: Player[] = [
    {
      gameInfo: 'SF@HOU',
      gradeOutOfTen: 9,
      id: '40470878',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: '49ers',
      nameAbbrev: '49ers',
      opposingTeamAbbrev: 'HOU',
      position: 'DST',
      salary: 2900,
      teamAbbrev: 'SF',
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 8.9,
      id: '40470880',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: 'Bengals',
      nameAbbrev: 'Bengals',
      opposingTeamAbbrev: 'NYJ',
      position: 'DST',
      salary: 2700,
      teamAbbrev: 'CIN',
    },
    {
      gameInfo: 'CHI@BAL',
      gradeOutOfTen: 8.8,
      id: '40470881',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: 'Bears',
      nameAbbrev: 'Bears',
      opposingTeamAbbrev: 'BAL',
      position: 'DST',
      salary: 2600,
      teamAbbrev: 'CHI',
    },
    {
      gameInfo: 'NYJ@CIN',
      gradeOutOfTen: 8.7,
      id: '40470885',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: 'Jets',
      nameAbbrev: 'Jets',
      opposingTeamAbbrev: 'CIN',
      position: 'DST',
      salary: 2300,
      teamAbbrev: 'NYJ',
    },
    {
      gameInfo: 'BUF@CAR',
      gradeOutOfTen: 8.6,
      id: '40470874',
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: 'Bills',
      nameAbbrev: 'Bills',
      opposingTeamAbbrev: 'CAR',
      position: 'DST',
      salary: 3300,
      teamAbbrev: 'BUF',
    },
  ];

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
    const rbCombosWithDuplicates = this.generateRbCombos(4);
    const lineupsArray: Lineup[] = [];
    this.qbPool.forEach((qb) => {
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
            const foundPlayerThatisOverLimit = pairing.passCatchers.some(
              (pc) => {
                let passCatcherDistribution: PlayerDistribution | undefined;

                if (pc.position === 'WR') {
                  passCatcherDistribution =
                    this.wideReceiverDistribution().find(
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
              }
            );
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
          lineupGroup: qb.id,
          lineupIndex: i,
          qb,
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

        // lineupsArray.push(currentLineup);
        this.lineups.update((lineups) => [...lineups, currentLineup]);
      }
    });

    // this.lineups.set(lineupsArray);
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

  generateRbCombos(numbberOfRb1s: number): Player[][] {
    // TODO: Set maxNumberOfLineups value dynamically
    const maxNumberOfLineups = 100;
    const rbCombos = [];
    const rbCombosWithDuplicates: Player[][] = [];
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

  updateLineup(updatedLineup: Lineup) {
    console.log('updatedLineup', updatedLineup);
    // TODO: is it more efficient to use find function?
    const updatedLineups: Lineup[] = this.lineups().map((lineup) => {
      if (
        lineup.lineupIndex === updatedLineup.lineupIndex &&
        lineup.lineupGroup === updatedLineup.lineupGroup
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

  outputAsJson() {
    const lineupsArrayJSON = JSON.stringify(
      this.convertLineupsToDraftKingsFormat()
    );

    // TODO: Save this to CSV instead of copying text
    navigator.clipboard.writeText(lineupsArrayJSON);
    console.log(lineupsArrayJSON);
  }
}
