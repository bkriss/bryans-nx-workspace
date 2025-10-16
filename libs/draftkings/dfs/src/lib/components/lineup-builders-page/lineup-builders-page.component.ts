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
import { max, min } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    LineupBuilderComponent,
    MatExpansionModule,
    PlayerDistributionsComponent,
  ],
  templateUrl: './lineup-builders-page.component.html',
  styleUrl: './lineup-builders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuildersPageComponent implements OnInit {
  lineups: WritableSignal<Lineup[]> = signal([]);
  readonly panelOpenState = signal(true);

  qbPool: Quarterback[] = [
    // {
    //   gameInfo: 'NE@NO',
    //   id: '40307944',
    //   maxOwnershipPercentage: 35,
    //   minOwnershipPercentage: 10,
    //   name: 'Drake Maye',
    //   nameAbbrev: 'D. Maye',
    //   position: 'QB',
    //   salary: 5900,
    //   teamAbbrev: 'NE',
    //   opposingTeamAbbrev: 'NO',
    //   maxNumberOfTeammatePasscatchers: 2,
    //   minNumberOfTeammatePasscatchers: 1,
    //   numberOfLineupsWithThisPlayer: 27,
    //   requirePassCatcherFromOpposingTeam: true,
    //   qbPassCatcherPairings: [],
    // },
    // {
    //   gameInfo: 'SEA@JAX',
    //   id: '40307951',
    //   maxOwnershipPercentage: 35,
    //   minOwnershipPercentage: 10,
    //   name: 'Trevor Lawrence',
    //   nameAbbrev: 'T. Lawrence',
    //   position: 'QB',
    //   salary: 5100,
    //   teamAbbrev: 'JAX',
    //   opposingTeamAbbrev: 'SEA',
    //   maxNumberOfTeammatePasscatchers: 2,
    //   minNumberOfTeammatePasscatchers: 1,
    //   numberOfLineupsWithThisPlayer: 25,
    //   requirePassCatcherFromOpposingTeam: true,
    //   qbPassCatcherPairings: [],
    // },
    {
      gameInfo: 'DAL@CAR',
      id: '40307938',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Dak Prescott',
      nameAbbrev: 'D. Prescott',
      position: 'QB',
      salary: 6500,
      teamAbbrev: 'DAL',
      opposingTeamAbbrev: 'CAR',
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 2,
      numberOfLineupsWithThisPlayer: 30,
      requirePassCatcherFromOpposingTeam: true,
      qbPassCatcherPairings: [],
    },
    // {
    //   gameInfo: 'CIN@GB',
    //   id: '40307941',
    //   maxOwnershipPercentage: 35,
    //   minOwnershipPercentage: 10,
    //   name: 'Jordan Love',
    //   nameAbbrev: 'J. Love',
    //   position: 'QB',
    //   salary: 6200,
    //   teamAbbrev: 'GB',
    //   opposingTeamAbbrev: 'CIN',
    //   maxNumberOfTeammatePasscatchers: 2,
    //   minNumberOfTeammatePasscatchers: 2,
    //   numberOfLineupsWithThisPlayer: 22,
    //   requirePassCatcherFromOpposingTeam: false,
    //   qbPassCatcherPairings: [],
    // },
  ];
  rbPool: RunningBack[] = [
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'CIN@GB',
      id: '40308012',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Josh Jacobs',
      nameAbbrev: 'J. Jacobs',
      position: 'RB',
      salary: 7300,
      teamAbbrev: 'GB',
      opposingTeamAbbrev: 'CIN',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'SF@TB',
      id: '40308008',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Christian McCaffrey',
      nameAbbrev: 'C. McCaffrey',
      position: 'RB',
      salary: 8400,
      teamAbbrev: 'SF',
      opposingTeamAbbrev: 'TB',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'DAL@CAR',
      id: '40308020',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Javonte Williams',
      nameAbbrev: 'J. Williams',
      position: 'RB',
      salary: 6400,
      teamAbbrev: 'DAL',
      opposingTeamAbbrev: 'CAR',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'DAL@CAR',
      id: '40308036',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 20,
      name: 'Rico Dowdle',
      nameAbbrev: 'R. Dowdle',
      position: 'RB',
      salary: 5800,
      teamAbbrev: 'CAR',
      opposingTeamAbbrev: 'DAL',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'ARI@IND',
      id: '40308006',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 15,
      name: 'Jonathan Taylor',
      nameAbbrev: 'J. Taylor',
      position: 'RB',
      salary: 8500,
      teamAbbrev: 'IND',
      opposingTeamAbbrev: 'ARI',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'LAR@BAL',
      id: '40308022',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 15,
      name: 'Kyren Williams',
      nameAbbrev: 'K. Williams',
      position: 'RB',
      salary: 6300,
      teamAbbrev: 'LAR',
      opposingTeamAbbrev: 'BAL',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'SF@TB',
      id: '40308028',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 15,
      name: 'Rachaad White',
      nameAbbrev: 'R. White',
      position: 'RB',
      salary: 6000,
      teamAbbrev: 'TB',
      opposingTeamAbbrev: 'SF',
    },
    {
      allowRBFromOpposingTeam: false,
      gameInfo: 'TEN@LV',
      id: '40308016',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 12,
      name: 'Ashton Jeanty',
      nameAbbrev: 'A. Jeanty',
      position: 'RB',
      salary: 6900,
      teamAbbrev: 'LV',
      opposingTeamAbbrev: 'TEN',
    },
  ];
  wrPool: WideReceiver[] = [
    {
      gameInfo: 'SEA@JAX',
      id: '40308236',
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 20,
      name: 'Jaxon Smith-Njigba',
      nameAbbrev: 'J. Smith-Njigba',
      position: 'WR',
      salary: 7600,
      teamAbbrev: 'SEA',
      opposingTeamAbbrev: 'JAX',
      gradeOutOfTen: 9,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAR@BAL',
      id: '40308232',
      maxOwnershipPercentage: 23,
      minOwnershipPercentage: 18,
      name: 'Puka Nacua',
      nameAbbrev: 'P. Nacua',
      position: 'WR',
      salary: 8700,
      teamAbbrev: 'LAR',
      opposingTeamAbbrev: 'BAL',
      gradeOutOfTen: 8.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NE@NO',
      id: '40308260',
      maxOwnershipPercentage: 22,
      minOwnershipPercentage: 17,
      name: 'Stefon Diggs',
      nameAbbrev: 'S. Diggs',
      position: 'WR',
      salary: 5800,
      teamAbbrev: 'NE',
      opposingTeamAbbrev: 'NO',
      gradeOutOfTen: 8.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SF@TB',
      id: '40308240',
      maxOwnershipPercentage: 18,
      minOwnershipPercentage: 13,
      name: 'Emeka Egbuka',
      nameAbbrev: 'E. Egbuka',
      position: 'WR',
      salary: 7200,
      teamAbbrev: 'TB',
      opposingTeamAbbrev: 'SF',
      gradeOutOfTen: 8,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NE@NO',
      id: '40308280',
      maxOwnershipPercentage: 18,
      minOwnershipPercentage: 13,
      name: 'Chris Olave',
      nameAbbrev: 'C. Olave',
      position: 'WR',
      salary: 5100,
      teamAbbrev: 'NO',
      opposingTeamAbbrev: 'NE',
      gradeOutOfTen: 7.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308250',
      maxOwnershipPercentage: 18,
      minOwnershipPercentage: 13,
      name: 'Jaylen Waddle',
      nameAbbrev: 'J. Waddle',
      position: 'WR',
      salary: 6100,
      teamAbbrev: 'MIA',
      opposingTeamAbbrev: 'LAC',
      gradeOutOfTen: 7.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CAR',
      id: '40308252',
      maxOwnershipPercentage: 18,
      minOwnershipPercentage: 13,
      maxOwnershipWhenPairedWithOpposingQb: 73,
      minOwnershipWhenPairedWithOpposingQb: 65,
      name: 'Tetairoa McMillan',
      nameAbbrev: 'T. McMillan',
      position: 'WR',
      salary: 6000,
      teamAbbrev: 'CAR',
      opposingTeamAbbrev: 'DAL',
      gradeOutOfTen: 7.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CAR',
      id: '40308242',
      maxOwnershipPercentage: 15,
      minOwnershipPercentage: 10,
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 70,
      name: 'George Pickens',
      nameAbbrev: 'G. Pickens',
      position: 'WR',
      salary: 6800,
      teamAbbrev: 'DAL',
      opposingTeamAbbrev: 'CAR',
      gradeOutOfTen: 7.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@IND',
      id: '40308274',
      maxOwnershipPercentage: 15,
      minOwnershipPercentage: 10,
      name: 'Michael Pittman Jr.',
      nameAbbrev: 'M. Pittman Jr.',
      position: 'WR',
      salary: 5400,
      teamAbbrev: 'IND',
      opposingTeamAbbrev: 'ARI',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308256',
      maxOwnershipPercentage: 15,
      minOwnershipPercentage: 10,
      name: 'Quentin Johnston',
      nameAbbrev: 'Q. Johnston',
      position: 'WR',
      salary: 5900,
      teamAbbrev: 'LAC',
      opposingTeamAbbrev: 'MIA',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308266',
      maxOwnershipPercentage: 15,
      minOwnershipPercentage: 10,
      name: 'Keenan Allen',
      nameAbbrev: 'K. Allen',
      position: 'WR',
      salary: 5600,
      teamAbbrev: 'LAC',
      opposingTeamAbbrev: 'MIA',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAR@BAL',
      id: '40308244',
      maxOwnershipPercentage: 15,
      minOwnershipPercentage: 10,
      name: 'Davante Adams',
      nameAbbrev: 'D. Adams',
      position: 'WR',
      salary: 6700,
      teamAbbrev: 'LAR',
      opposingTeamAbbrev: 'BAL',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SEA@JAX',
      id: '40308248',
      maxOwnershipPercentage: 13,
      minOwnershipPercentage: 6,
      name: 'Brian Thomas Jr.',
      nameAbbrev: 'B. Thomas Jr.',
      position: 'WR',
      salary: 6200,
      teamAbbrev: 'JAX',
      opposingTeamAbbrev: 'SEA',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SEA@JAX',
      id: '40308298',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Cooper Kupp',
      nameAbbrev: 'C. Kupp',
      position: 'WR',
      salary: 4600,
      teamAbbrev: 'SEA',
      opposingTeamAbbrev: 'JAX',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TEN@LV',
      id: '40308286',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Calvin Ridley',
      nameAbbrev: 'C. Ridley',
      position: 'WR',
      salary: 4900,
      teamAbbrev: 'TEN',
      opposingTeamAbbrev: 'LV',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },

    {
      gameInfo: 'CLE@PIT',
      id: '40308270',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'DK Metcalf',
      nameAbbrev: 'D. Metcalf',
      position: 'WR',
      salary: 5500,
      teamAbbrev: 'PIT',
      opposingTeamAbbrev: 'CLE',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308264',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Ladd McConkey',
      nameAbbrev: 'L. McConkey',
      position: 'WR',
      salary: 5700,
      teamAbbrev: 'LAC',
      opposingTeamAbbrev: 'MIA',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CIN@GB',
      id: '40308278',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Romeo Doubs',
      nameAbbrev: 'R. Doubs',
      position: 'WR',
      salary: 5200,
      teamAbbrev: 'GB',
      opposingTeamAbbrev: 'CIN',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'ARI@IND',
      id: '40308276',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Marvin Harrison Jr.',
      nameAbbrev: 'M. Harrison Jr.',
      position: 'WR',
      salary: 5300,
      teamAbbrev: 'ARI',
      opposingTeamAbbrev: 'IND',
      gradeOutOfTen: 6,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CIN@GB',
      id: '40308282',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Matthew Golden',
      nameAbbrev: 'M. Golden',
      position: 'WR',
      salary: 5000,
      teamAbbrev: 'GB',
      opposingTeamAbbrev: 'CIN',
      gradeOutOfTen: 6,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'TEN@LV',
      id: '40308258',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Jakobi Meyers',
      nameAbbrev: 'J. Meyers',
      position: 'WR',
      salary: 5800,
      teamAbbrev: 'LV',
      opposingTeamAbbrev: 'TEN',
      gradeOutOfTen: 6,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SF@TB',
      id: '40308340',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Demarcus Robinson',
      nameAbbrev: 'D. Robinson',
      position: 'WR',
      salary: 3600,
      teamAbbrev: 'SF',
      opposingTeamAbbrev: 'TB',
      gradeOutOfTen: 5.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SEA@JAX',
      id: '40308294',
      maxOwnershipPercentage: 12,
      minOwnershipPercentage: 5,
      name: 'Travis Hunter',
      nameAbbrev: 'T. Hunter',
      position: 'WR',
      salary: 4700,
      teamAbbrev: 'JAX',
      opposingTeamAbbrev: 'SEA',
      gradeOutOfTen: 5.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'NE@NO',
      id: '40308326',
      maxOwnershipPercentage: 10,
      minOwnershipPercentage: 5,
      name: 'Kayshon Boutte',
      nameAbbrev: 'K. Boutte',
      position: 'WR',
      salary: 3800,
      teamAbbrev: 'NE',
      opposingTeamAbbrev: 'NO',
      gradeOutOfTen: 5.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'NE@NO',
      id: '40308296',
      maxOwnershipPercentage: 10,
      minOwnershipPercentage: 5,
      name: 'Rashid Shaheed',
      nameAbbrev: 'R. Shaheed',
      position: 'WR',
      salary: 4600,
      teamAbbrev: 'NO',
      opposingTeamAbbrev: 'NE',
      gradeOutOfTen: 5.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'DAL@CAR',
      id: '40308338',
      maxOwnershipPercentage: 8,
      minOwnershipPercentage: 0,
      maxOwnershipWhenPairedWithQb: 30,
      minOwnershipWhenPairedWithQb: 20,
      name: 'Ryan Flournoy',
      nameAbbrev: 'R. Flournoy',
      position: 'WR',
      salary: 3600,
      teamAbbrev: 'DAL',
      opposingTeamAbbrev: 'CAR',
      gradeOutOfTen: 5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'SEA@JAX',
      id: '40308312',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Dyami Brown',
      nameAbbrev: 'D. Brown',
      position: 'WR',
      salary: 4200,
      teamAbbrev: 'JAX',
      opposingTeamAbbrev: 'SEA',
      gradeOutOfTen: 5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'CIN@GB',
      id: '40308234',
      maxOwnershipPercentage: 8,
      minOwnershipPercentage: 0,
      name: "Ja'Marr Chase",
      nameAbbrev: 'J. Chase',
      position: 'WR',
      salary: 7700,
      teamAbbrev: 'CIN',
      opposingTeamAbbrev: 'GB',
      gradeOutOfTen: 5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
  ];
  tePool: TightEnd[] = [
    {
      gameInfo: 'CIN@GB',
      id: '40308616',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Tucker Kraft',
      nameAbbrev: 'T. Kraft',
      position: 'TE',
      salary: 4700,
      teamAbbrev: 'GB',
      opposingTeamAbbrev: 'CIN',
      gradeOutOfTen: 8.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CAR',
      id: '40308610',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      maxOwnershipWhenPairedWithQb: 90,
      minOwnershipWhenPairedWithQb: 70,
      name: 'Jake Ferguson',
      nameAbbrev: 'J. Ferguson',
      position: 'TE',
      salary: 5300,
      teamAbbrev: 'DAL',
      opposingTeamAbbrev: 'CAR',
      gradeOutOfTen: 8,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@IND',
      id: '40308608',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Trey McBride',
      nameAbbrev: 'T. McBride',
      position: 'TE',
      salary: 5500,
      teamAbbrev: 'ARI',
      opposingTeamAbbrev: 'IND',
      gradeOutOfTen: 8,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'TEN@LV',
      id: '40308648',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Michael Mayer',
      nameAbbrev: 'M. Mayer',
      position: 'TE',
      salary: 3100,
      teamAbbrev: 'LV',
      opposingTeamAbbrev: 'TEN',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308622',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Darren Waller',
      nameAbbrev: 'D. Waller',
      position: 'TE',
      salary: 4000,
      teamAbbrev: 'MIA',
      opposingTeamAbbrev: 'LAC',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@IND',
      id: '40308614',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Tyler Warren',
      nameAbbrev: 'T. Warren',
      position: 'TE',
      salary: 4900,
      teamAbbrev: 'IND',
      opposingTeamAbbrev: 'ARI',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NE@NO',
      id: '40308620',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Hunter Henry',
      nameAbbrev: 'H. Henry',
      position: 'TE',
      salary: 4300,
      teamAbbrev: 'NE',
      opposingTeamAbbrev: 'NO',
      gradeOutOfTen: 7,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'SF@TB',
      id: '40308626',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Jake Tonges',
      nameAbbrev: 'J. Tonges',
      position: 'TE',
      salary: 3700,
      teamAbbrev: 'SF',
      opposingTeamAbbrev: 'TB',
      gradeOutOfTen: 6.5,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'SEA@JAX',
      id: '40308684',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Hunter Long',
      nameAbbrev: 'H. Long',
      position: 'TE',
      salary: 2500,
      teamAbbrev: 'JAX',
      opposingTeamAbbrev: 'SEA',
      gradeOutOfTen: 4,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
  ];
  dstPool: Player[] = [
    {
      gameInfo: 'TEN@LV',
      id: '40308825',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Raiders',
      nameAbbrev: 'Raiders',
      position: 'DST',
      salary: 3200,
      teamAbbrev: 'LV',
      opposingTeamAbbrev: 'TEN',
    },
    {
      gameInfo: 'CLE@PIT',
      id: '40308833',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Browns',
      nameAbbrev: 'Browns',
      position: 'DST',
      salary: 2500,
      teamAbbrev: 'CLE',
      opposingTeamAbbrev: 'PIT',
    },
    {
      gameInfo: 'TEN@LV',
      id: '40308835',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 25,
      name: 'Titans',
      nameAbbrev: 'Titans',
      position: 'DST',
      salary: 2400,
      teamAbbrev: 'TEN',
      opposingTeamAbbrev: 'LV',
    },
    {
      gameInfo: 'CIN@GB',
      id: '40308820',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 20,
      name: 'Packers',
      nameAbbrev: 'Packers',
      position: 'DST',
      salary: 3700,
      teamAbbrev: 'GB',
      opposingTeamAbbrev: 'CIN',
    },
    {
      gameInfo: 'LAC@MIA',
      id: '40308837',
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      name: 'Dolphins',
      nameAbbrev: 'Dolphins',
      position: 'DST',
      salary: 2200,
      teamAbbrev: 'MIA',
      opposingTeamAbbrev: 'LAC',
    },
  ];

  currentQb: WritableSignal<Quarterback> = signal(this.qbPool[0]);

  // TODO: Remove quarterbackDistribution?
  quarterbackDistribution: Signal<PlayerDistribution[]> = computed(() =>
    this.qbPool
      .map((qb) => this.calculatePlayerDistribution(qb as Player, Position.QB))
      .sort((a, b) => b.count - a.count)
  );

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
    console.log('qbPool after pairings', this.qbPool);
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
    // additionalRb?: RunningBack,
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

        console.log('boobs 1', qb.qbPassCatcherPairings);
        console.log('boobs 2', qbPassCatcherPairingsAccountingForPlayerLimits);
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
            if (passCatcherStack.passCatchers.length === 2) {
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
    const lineupsArrayJSON = JSON.stringify(
      this.convertLineupsToDraftKingsFormat()
    );
    console.log('lineupsArrayJSON', lineupsArrayJSON);
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
}
