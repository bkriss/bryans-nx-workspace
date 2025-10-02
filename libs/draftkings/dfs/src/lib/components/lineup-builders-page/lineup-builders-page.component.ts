import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Lineup,
  Player,
  Quarterback,
  TightEnd,
  WideReceiver,
} from '../../models';
import { LineupBuilderComponent } from '../lineup-builder/lineup-builder.component';

import {
  findCheapestPlayer,
  findCheapestPlayersSalary,
  findSecondCheapestPlayersSalary,
  findThirdCheapestPlayersSalary,
} from '../../utils';

@Component({
  imports: [CommonModule, LineupBuilderComponent],
  templateUrl: './lineup-builders-page.component.html',
  styleUrl: './lineup-builders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuildersPageComponent implements OnInit {
  lineups: WritableSignal<Lineup[]> = signal([
    // {
    //   lineupNumber: 1,
    //   qb: {
    //     gameInfo: 'BUF@NYJ 09/14/2025 01:00PM ET',
    //     id: '39971296',
    //     name: 'Josh Allen',
    //     position: 'QB',
    //     salary: 7100,
    //     teamAbbrev: 'BUF',
    //   },
    //   rb1: null,
    //   rb2: null,
    //   wr1: null,
    //   wr2: null,
    //   te: null,
    //   flex: null,
    //   dst: null,
    //   remainingSalary: 42900,
    // },
  ]);

  qbPool: Quarterback[] = [
    {
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 1,
      gameInfo: 'DAL@CHI',
      id: '40058165',
      name: 'Caleb Williams',
      nameAbbrev: 'C. Williams',
      position: 'QB',
      salary: 5600,
      teamAbbrev: 'CHI',
      opposingTeam: 'DAL',
      numberOfLineupsWithThisPlayer: 10,
      qbPassCatcherPairings: [],
      requirePassCatcherFromOpposingTeam: true,
    },
    // {
    //   maxNumberOfTeammatePasscatchers: 1,
    //   minNumberOfTeammatePasscatchers: 1,
    //   gameInfo: 'PIT@NE',
    //   id: '40058171',
    //   name: 'Drake Maye',
    //   nameAbbrev: 'D. Maye',
    //   position: 'QB',
    //   salary: 5300,
    //   teamAbbrev: 'NE',
    //   opposingTeam: 'PIT',
    //   numberOfLineupsWithThisPlayer: 12,
    //   qbPassCatcherPairings: [],
    //   requirePassCatcherFromOpposingTeam: false,
    // },
    {
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 2,
      gameInfo: 'DAL@CHI',
      id: '40058162',
      name: 'Dak Prescott',
      nameAbbrev: 'D. Prescott',
      position: 'QB',
      salary: 5900,
      teamAbbrev: 'DAL',
      opposingTeam: 'CHI',
      numberOfLineupsWithThisPlayer: 10,
      qbPassCatcherPairings: [],
      requirePassCatcherFromOpposingTeam: true,
    },
    // {
    //   gameInfo: 'LV@WAS',
    //   id: '40058211',
    //   name: 'Marcus Mariota',
    //   nameAbbrev: 'M. Mariota',
    //   position: 'QB',
    //   salary: 4000,
    //   teamAbbrev: 'WAS',
    //   opposingTeam: 'LV',
    //   maxNumberOfTeammatePasscatchers: 2,
    //   minNumberOfTeammatePasscatchers: 1,
    //   numberOfLineupsWithThisPlayer: 10,
    //   requirePassCatcherFromOpposingTeam: true,
    //   qbPassCatcherPairings: [],
    // },
    // {
    //   maxNumberOfTeammatePasscatchers: 2,
    //   minNumberOfTeammatePasscatchers: 2,
    //   gameInfo: 'CIN@MIN',
    //   id: '40058194',
    //   name: 'Carson Wentz',
    //   nameAbbrev: 'C. Wentz',
    //   position: 'QB',
    //   salary: 4000,
    //   teamAbbrev: 'MIN',
    //   opposingTeam: 'CIN',
    //   numberOfLineupsWithThisPlayer: 15,
    //   qbPassCatcherPairings: [],
    //   requirePassCatcherFromOpposingTeam: true,
    // },
  ];
  rbPool: Player[] = [
    {
      gameInfo: 'DET@CIN',
      id: '40235748',
      name: 'Jahmyr Gibbs',
      nameAbbrev: 'J. Gibbs',
      position: 'RB',
      salary: 7700,
      teamAbbrev: 'DET',
      opposingTeam: 'CIN',
    },
    {
      gameInfo: 'MIA@CAR',
      id: '40235752',
      name: "De'Von Achane",
      nameAbbrev: 'D. Achane',
      position: 'RB',
      salary: 7300,
      teamAbbrev: 'MIA',
      opposingTeam: 'CAR',
    },
    {
      gameInfo: 'DAL@NYJ',
      id: '40235764',
      name: 'Javonte Williams',
      nameAbbrev: 'J. Williams',
      position: 'RB',
      salary: 6200,
      teamAbbrev: 'DAL',
      opposingTeam: 'NYJ',
    },
    {
      gameInfo: 'NYG@NO',
      id: '40235768',
      name: 'Cam Skattebo',
      nameAbbrev: 'C. Skattebo',
      position: 'RB',
      salary: 6000,
      teamAbbrev: 'NYG',
      opposingTeam: 'NO',
    },
    {
      gameInfo: 'WAS@LAC',
      id: '40235760',
      name: 'Omarion Hampton',
      nameAbbrev: 'O. Hampton',
      position: 'RB',
      salary: 6500,
      teamAbbrev: 'LAC',
      opposingTeam: 'WAS',
    },
    {
      gameInfo: 'MIA@CAR',
      id: '40235772',
      name: 'Chuba Hubbard',
      nameAbbrev: 'C. Hubbard',
      position: 'RB',
      salary: 5800,
      teamAbbrev: 'CAR',
      opposingTeam: 'MIA',
    },
    {
      gameInfo: 'LV@IND',
      id: '40235746',
      name: 'Jonathan Taylor',
      nameAbbrev: 'J. Taylor',
      position: 'RB',
      salary: 8000,
      teamAbbrev: 'IND',
      opposingTeam: 'LV',
    },
    {
      gameInfo: 'DAL@NYJ',
      id: '40235776',
      name: 'Breece Hall',
      nameAbbrev: 'B. Hall',
      position: 'RB',
      salary: 5600,
      teamAbbrev: 'NYJ',
      opposingTeam: 'DAL',
    },
    {
      gameInfo: 'HOU@BAL',
      id: '40235782',
      name: 'Woody Marks',
      nameAbbrev: 'W. Marks',
      position: 'RB',
      salary: 5400,
      teamAbbrev: 'HOU',
      opposingTeam: 'BAL',
    },
    {
      gameInfo: 'HOU@BAL',
      id: '40235756',
      name: 'Derrick Henry',
      nameAbbrev: 'D. Henry',
      position: 'RB',
      salary: 7000,
      teamAbbrev: 'BAL',
      opposingTeam: 'HOU',
    },
  ];
  tePool: TightEnd[] = [
    {
      gameInfo: 'ARI@SF',
      id: '40059022',
      name: 'Trey McBride',
      nameAbbrev: 'T. McBride',
      position: 'TE',
      salary: 5700,
      teamAbbrev: 'ARI',
      opposingTeam: 'SF',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'IND@TEN',
      id: '40059026',
      name: 'Tyler Warren',
      nameAbbrev: 'T. Warren',
      position: 'TE',
      salary: 4400,
      teamAbbrev: 'IND',
      opposingTeam: 'TEN',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NO@SEA',
      id: '40059034',
      name: 'Juwan Johnson',
      nameAbbrev: 'J. Johnson',
      position: 'TE',
      salary: 3900,
      teamAbbrev: 'NO',
      opposingTeam: 'SEA',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40059032',
      name: 'Jake Ferguson',
      nameAbbrev: 'J. Ferguson',
      position: 'TE',
      salary: 4000,
      teamAbbrev: 'DAL',
      opposingTeam: 'CHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40059038',
      name: 'T.J. Hockenson',
      nameAbbrev: 'T. Hockenson',
      position: 'TE',
      salary: 3800,
      teamAbbrev: 'MIN',
      opposingTeam: 'CIN',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'GB@CLE',
      id: '40059048',
      name: 'Harold Fannin Jr.',
      nameAbbrev: 'H. Fannin',
      position: 'TE',
      salary: 3600,
      teamAbbrev: 'CLE',
      opposingTeam: 'GB',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'PIT@NE',
      id: '40059040',
      name: 'Hunter Henry',
      nameAbbrev: 'H. Henry',
      position: 'TE',
      salary: 3800,
      teamAbbrev: 'NE',
      opposingTeam: 'PIT',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
  ];
  wrPool: WideReceiver[] = [
    {
      gameInfo: 'DEN@LAC',
      id: '40058612',
      name: 'Keenan Allen',
      nameAbbrev: 'K. Allen',
      position: 'WR',
      salary: 4700,
      teamAbbrev: 'LAC',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
      opposingTeam: 'DEN',
    },
    {
      gameInfo: 'NO@SEA',
      id: '40058548',
      name: 'Jaxon Smith-Njigba',
      nameAbbrev: 'J. Smith-Njigba',
      position: 'WR',
      salary: 6500,
      teamAbbrev: 'SEA',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
      opposingTeam: 'NO',
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40058588',
      name: 'Rome Odunze',
      nameAbbrev: 'R. Odunze',
      position: 'WR',
      salary: 5300,
      teamAbbrev: 'CHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
      opposingTeam: 'DAL',
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40058536',
      name: 'CeeDee Lamb',
      nameAbbrev: 'C. Lamb',
      position: 'WR',
      salary: 8000,
      teamAbbrev: 'DAL',
      opposingTeam: 'CHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LV@WAS',
      id: '40058578',
      name: 'Jakobi Meyers',
      nameAbbrev: 'J. Meyers',
      position: 'WR',
      salary: 5600,
      teamAbbrev: 'LV',
      opposingTeam: 'WAS',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAR@PHI',
      id: '40058538',
      name: 'Puka Nacua',
      nameAbbrev: 'P. Nacua',
      position: 'WR',
      salary: 7700,
      teamAbbrev: 'LAR',
      opposingTeam: 'PHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LAR@PHI',
      id: '40058556',
      name: 'Davante Adams',
      nameAbbrev: 'D. Adams',
      position: 'WR',
      salary: 6200,
      teamAbbrev: 'LAR',
      opposingTeam: 'PHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ATL@CAR',
      id: '40058570',
      name: 'Tetairoa McMillan',
      nameAbbrev: 'T. McMillan',
      position: 'WR',
      salary: 5900,
      teamAbbrev: 'CAR',
      opposingTeam: 'ATL',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ATL@CAR',
      id: '40058564',
      name: 'Drake London',
      nameAbbrev: 'D. London',
      position: 'WR',
      salary: 6000,
      teamAbbrev: 'ATL',
      opposingTeam: 'CAR',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40058568',
      name: 'George Pickens',
      nameAbbrev: 'G. Pickens',
      position: 'WR',
      salary: 5900,
      teamAbbrev: 'DAL',
      opposingTeam: 'CHI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@SF',
      id: '40058582',
      name: 'Ricky Pearsall',
      nameAbbrev: 'R. Pearsall',
      position: 'WR',
      salary: 5500,
      teamAbbrev: 'SF',
      opposingTeam: 'ARI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DEN@LAC',
      id: '40058642',
      name: 'Troy Franklin',
      nameAbbrev: 'T. Franklin',
      position: 'WR',
      salary: 4000,
      teamAbbrev: 'DEN',
      opposingTeam: 'LAC',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40058586',
      name: 'DJ Moore',
      nameAbbrev: 'D. Moore',
      position: 'WR',
      salary: 5400,
      teamAbbrev: 'CHI',
      opposingTeam: 'DAL',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'NO@SEA',
      id: '40058594',
      name: 'Chris Olave',
      nameAbbrev: 'C. Olave',
      position: 'WR',
      salary: 5200,
      teamAbbrev: 'NO',
      opposingTeam: 'SEA',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@SF',
      id: '40058600',
      name: 'Jauan Jennings',
      nameAbbrev: 'J. Jennings',
      position: 'WR',
      salary: 5000,
      teamAbbrev: 'SF',
      opposingTeam: 'ARI',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'LV@WAS',
      id: '40058560',
      name: 'Deebo Samuel Sr.',
      nameAbbrev: 'D. Samuel',
      position: 'WR',
      salary: 6100,
      teamAbbrev: 'WAS',
      opposingTeam: 'LV',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40058540',
      name: 'Justin Jefferson',
      nameAbbrev: 'J. Jefferson',
      position: 'WR',
      salary: 7500,
      teamAbbrev: 'MIN',
      opposingTeam: 'CIN',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'GB@CLE',
      id: '40058658',
      name: 'Dontayvion Wicks',
      nameAbbrev: 'D. Wicks',
      position: 'WR',
      salary: 3700,
      teamAbbrev: 'GB',
      opposingTeam: 'CLE',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'IND@TEN',
      id: '40058660',
      name: 'Elic Ayomanor',
      nameAbbrev: 'E. Ayomanor',
      position: 'WR',
      salary: 3700,
      teamAbbrev: 'TEN',
      opposingTeam: 'IND',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'ARI@SF',
      id: '40058576',
      name: 'Marvin Harrison Jr.',
      nameAbbrev: 'M. Harrison',
      position: 'WR',
      salary: 5600,
      teamAbbrev: 'ARI',
      opposingTeam: 'SF',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    },
    {
      gameInfo: 'DAL@CHI',
      id: '40058684',
      name: 'Olamide Zaccheaus',
      nameAbbrev: 'O. Zaccheaus',
      position: 'WR',
      salary: 3400,
      teamAbbrev: 'CHI',
      opposingTeam: 'DAL',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'LV@WAS',
      id: '40058572',
      name: 'Terry McLaurin',
      nameAbbrev: 'T. McLaurin',
      position: 'WR',
      salary: 5800,
      teamAbbrev: 'WAS',
      opposingTeam: 'LV',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'PIT@NE',
      id: '40058608',
      name: 'Stefon Diggs',
      nameAbbrev: 'S. Diggs',
      position: 'WR',
      salary: 4800,
      teamAbbrev: 'NE',
      opposingTeam: 'PIT',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'PIT@NE',
      id: '40058618',
      name: 'Kayshon Boutte',
      nameAbbrev: 'K. Boutte',
      position: 'WR',
      salary: 4600,
      teamAbbrev: 'NE',
      opposingTeam: 'PIT',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40058566',
      name: 'Tee Higgins',
      nameAbbrev: 'T. Higgins',
      position: 'WR',
      salary: 6100,
      teamAbbrev: 'CIN',
      opposingTeam: 'MIN',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40058534',
      name: "Ja'Marr Chase",
      nameAbbrev: 'J. Chase',
      position: 'WR',
      salary: 8100,
      teamAbbrev: 'CIN',
      opposingTeam: 'MIN',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'ATL@CAR',
      id: '40058620',
      name: 'Darnell Mooney',
      nameAbbrev: 'D. Mooney',
      position: 'WR',
      salary: 4500,
      teamAbbrev: 'ATL',
      opposingTeam: 'CAR',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'PIT@NE',
      id: '40058640',
      name: 'Calvin Austin III',
      nameAbbrev: 'C. Austin',
      position: 'WR',
      salary: 4000,
      teamAbbrev: 'PIT',
      opposingTeam: 'NE',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
    {
      gameInfo: 'PIT@NE',
      id: '40058574',
      name: 'DK Metcalf',
      nameAbbrev: 'D. Metcalf',
      position: 'WR',
      salary: 5700,
      teamAbbrev: 'PIT',
      opposingTeam: 'NE',
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: true,
    },
  ];
  dstPool: Player[] = [
    {
      gameInfo: 'IND@TEN',
      id: '40059310',
      name: 'Colts',
      nameAbbrev: 'Colts',
      position: 'DST',
      salary: 3300,
      teamAbbrev: 'IND',
      opposingTeam: 'TEN',
    },
    {
      gameInfo: 'ATL@CAR',
      id: '40059311',
      name: 'Falcons',
      nameAbbrev: 'Falcons',
      position: 'DST',
      salary: 3200,
      teamAbbrev: 'ATL',
      opposingTeam: 'CAR',
    },
    {
      gameInfo: 'GB@CLE',
      id: '40059306',
      name: 'Packers',
      nameAbbrev: 'Packers',
      position: 'DST',
      salary: 3700,
      teamAbbrev: 'GB',
      opposingTeam: 'CLE',
    },
    {
      gameInfo: 'HOU@JAX',
      id: '40059318',
      name: 'Jaguars',
      nameAbbrev: 'Jags',
      position: 'DST',
      salary: 2800,
      teamAbbrev: 'JAX',
      opposingTeam: 'HOU',
    },
    {
      gameInfo: 'LV@WAS',
      id: '40059314',
      name: 'Commanders',
      nameAbbrev: 'Commanders',
      position: 'DST',
      salary: 3000,
      teamAbbrev: 'WAS',
      opposingTeam: 'LV',
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40059327',
      name: 'Bengals',
      nameAbbrev: 'Bengals',
      position: 'DST',
      salary: 2400,
      teamAbbrev: 'CIN',
      opposingTeam: 'MIN',
    },
    {
      gameInfo: 'LV@WAS',
      id: '40059328',
      name: 'Raiders',
      nameAbbrev: 'Raiders',
      position: 'DST',
      salary: 2300,
      teamAbbrev: 'LV',
      opposingTeam: 'WAS',
    },
    {
      gameInfo: 'CIN@MIN',
      id: '40059309',
      name: 'Vikings',
      nameAbbrev: 'Vikes',
      position: 'DST',
      salary: 3400,
      teamAbbrev: 'MIN',
      opposingTeam: 'CIN',
    },
  ];

  ngOnInit(): void {
    this.generateQbPassCatcherPairings();
    this.generateLineups();
  }

  // TODO: Should this replace calculateTotalCostOfCheapestPossibleRemainingPlayers?
  calculateTotalCostOfCheapestPossibleRemainingPlayers2(
    currentLineup: Lineup,
    positionToExclude: string
  ): number {
    let totalCostOfCheapestPossibleRemainingPlayers = 0;
    // TODO: Make this a signal
    let restrictedDsts = [
      currentLineup.qb.opposingTeam,
      currentLineup.qb.teamAbbrev,
      currentLineup.rb1?.opposingTeam,
      currentLineup.rb2?.opposingTeam,
    ];
    // TODO: Make this a signal
    let restrictedPassCatcherTeams = [
      currentLineup.qb.teamAbbrev,
      currentLineup.qb.opposingTeam,
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
    const eligibleDsts = this.dstPool.filter(
      (dst) => !restrictedDsts.includes(dst.teamAbbrev)
    );

    if (!currentLineup.wr1 && positionToExclude !== 'WR1') {
      // const costOfCheapestWr = findCheapestPlayersSalary(eligibleWideReceivers);
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [...restrictedDsts, cheapestEligibleWr.opposingTeam];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      eligibleWideReceivers = eligibleWideReceivers.filter(
        (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
      eligibleTightEnds = eligibleTightEnds.filter(
        (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
    }

    if (!currentLineup.wr2 && positionToExclude !== 'WR2') {
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [...restrictedDsts, cheapestEligibleWr.opposingTeam];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      eligibleWideReceivers = eligibleWideReceivers.filter(
        (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
      eligibleTightEnds = eligibleTightEnds.filter(
        (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
    }

    if (!currentLineup.wr3 && positionToExclude !== 'WR3') {
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [...restrictedDsts, cheapestEligibleWr.opposingTeam];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      eligibleWideReceivers = eligibleWideReceivers.filter(
        (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
      eligibleTightEnds = eligibleTightEnds.filter(
        (te) => te.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
    }

    if (!currentLineup.te && positionToExclude !== 'TE') {
      const cheapestEligibleTe = findCheapestPlayer(eligibleTightEnds);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleTe.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [...restrictedDsts, cheapestEligibleTe.opposingTeam];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleTe.teamAbbrev,
      ];
      eligibleWideReceivers = eligibleWideReceivers.filter(
        (wr) => wr.teamAbbrev !== cheapestEligibleTe.teamAbbrev
      );
    }

    if (!currentLineup.flex && positionToExclude !== 'FLEX') {
      const cheapestEligibleWr = findCheapestPlayer(eligibleWideReceivers);
      totalCostOfCheapestPossibleRemainingPlayers += cheapestEligibleWr.salary;
      // TODO: Setup computed signal so this updates automatically?
      restrictedDsts = [...restrictedDsts, cheapestEligibleWr.opposingTeam];
      restrictedPassCatcherTeams = [
        ...restrictedPassCatcherTeams,
        cheapestEligibleWr.teamAbbrev,
      ];
      eligibleWideReceivers = eligibleWideReceivers.filter(
        (wr) => wr.teamAbbrev !== cheapestEligibleWr.teamAbbrev
      );
    }

    if (!currentLineup.dst && positionToExclude !== 'DST') {
      const costOfCheapestDst = findCheapestPlayersSalary(eligibleDsts);
      totalCostOfCheapestPossibleRemainingPlayers += costOfCheapestDst;
    }

    return totalCostOfCheapestPossibleRemainingPlayers;
  }

  calculateTotalCostOfCheapestPossibleRemainingPlayers(
    passCatcherCombo: Player[],
    qb: Quarterback,
    rb1: Player,
    rb2: Player
  ): number {
    const restrictedDsts = [
      qb.opposingTeam,
      qb.teamAbbrev,
      rb1.opposingTeam,
      rb2.opposingTeam,
    ];

    // Not allowing pass catchers to be on QB team or QB opponent because we've already added QB stacks at this point
    // TODO: Filter out players from passCatcherCombo so we avoid duplicates
    const restrictedPassCatcherTeams = [
      qb.teamAbbrev,
      qb.opposingTeam,
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

    const costOfCheapestDefense = findCheapestPlayersSalary(eligibleDsts);
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

  // TODO: Add logic that prevents multiple players from the same team unless they're pass catchers for that lineup's QB
  // TOOD: Add logic to account for onlyUseIfPartOfStackOrPlayingWithOrAgainstQb flag
  // TOOD: Add logic to account for requirePassCatcherFromOpposingTeam flag
  // TOOD: Add logic to increase probability of certain players being in certain lineups
  generateLineups(): void {
    const rbCombosWithDuplicates = this.generateRbCombos(4);
    const lineupsArray: Lineup[] = [];
    this.qbPool.forEach((qb) => {
      // console.log('QB Pool Player:', qb);

      if (!qb.numberOfLineupsWithThisPlayer) return;

      const filteredRbCombos = rbCombosWithDuplicates.filter(
        (rbCombo) =>
          rbCombo[0].teamAbbrev !== qb.teamAbbrev &&
          rbCombo[1].teamAbbrev !== qb.teamAbbrev
      );

      /*

      /*
       * 1. Get WR/TE combo for current QB in loop
       * 2. Check if remaining salary after adding these 2-3 players
       * would be >= to the total cost of the cheapest player(s) at the other positions.
       * If not, skip to next WR/TE combo.
       */

      // qb.qbPassCatcherPairings.forEach((passCatcherCombo, i) => {
      //   console.log(`passCatcherCombo ${i}:`, passCatcherCombo);
      // const totalCostOfThisCombo = passCatcherCombo.reduce(
      //   (acc, player) => acc + player.salary,
      //   0
      // );
      // const remainingSalaryAfterThisCombo =
      //   50000 - qb.salary - totalCostOfThisCombo;
      // const cheapestPossibleRemainingPlayers =
      //   3400 + // DST
      //   4000 + // RB2
      //   3400 + // RB1
      //   3600; // TE or WR3

      // });

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

        // const restrictedDsts = [
        //   qb.opposingTeam,
        //   qb.teamAbbrev,
        //   rb1.opposingTeam,
        //   rb2.opposingTeam,
        // ];

        // TODO: Need to add WR/TE stack to lineup, but need to ensure salary cap isn't exceeded
        // and that team affiliation rules are followed

        console.log('qbPassCatcherPairings 69 ', qb.qbPassCatcherPairings);

        // for (const passCatcherCombo of qb.qbPassCatcherPairings) {

        // }

        // loop through each QB/Pass Catcher pairing
        // qb.qbPassCatcherPairings.find((passCatcherCombo, i) => {
        for (const passCatcherStack of qb.qbPassCatcherPairings) {
          const totalCostOfThisPassCatcherCombo = passCatcherStack.reduce(
            (acc, player) => acc + player.salary,
            0
          );

          const totalCostOfQbRbComboAndThisPassCatcherCombo =
            qb.salary - totalRbComboSalary - totalCostOfThisPassCatcherCombo;

          const totalCostOfCheapestPossibleRemainingPlayers =
            this.calculateTotalCostOfCheapestPossibleRemainingPlayers(
              passCatcherStack,
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
            if (passCatcherStack.length === 2) {
              if (passCatcherStack[0].position === 'TE') {
                te = passCatcherStack[0] as TightEnd;
                wr1 = passCatcherStack[1] as WideReceiver;
              } else if (passCatcherStack[1].position === 'TE') {
                te = passCatcherStack[1] as TightEnd;
                wr1 = passCatcherStack[0] as WideReceiver;
              } else {
                wr1 = passCatcherStack[0] as WideReceiver;
                wr2 = passCatcherStack[1] as WideReceiver;
              }
            } else if (passCatcherStack.length === 3) {
              const wrs = passCatcherStack.filter(
                (pc) => pc.position === 'WR'
              ) as WideReceiver[];
              te =
                (passCatcherStack.find(
                  (pc) => pc.position === 'TE'
                ) as TightEnd) || null;
              wr1 = wrs[0] || null;
              wr2 = wrs[1] || null;
              wr3 = wrs[2] || null;
            }

            // return true; // Break out of find loop
            break;
          }

          // return false;
          break;
          // });
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
          qb.opposingTeam,
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
          console.log(
            'no flex found. ',
            costOfCheapestPossibleRemainingPlayers
          );
          flex = this.findWideReceiverThatFitsBudget(
            currentLineup.remainingSalary,
            restrictedPassCatcherTeams,
            costOfCheapestPossibleRemainingPlayers
          );

          console.log('flex', flex);
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

          console.log('tightend', te);

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

        // if (!dst) {
        dst = this.findDstThatFitsBudget(currentLineup);

        if (dst) {
          currentLineup.dst = dst;
          currentLineup.remainingSalary =
            currentLineup.remainingSalary - dst.salary;
          currentCost += dst.salary;
        }
        // }

        lineupsArray.push(currentLineup);
      }
    });

    this.lineups.set(lineupsArray);
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
          !restrictedPassCatcherTeams.includes(te.teamAbbrev) &&
          remainingSalaryAfterAddingTeAndCheapestRemainingPlayers >= 0
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

        // return (
        //   !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
        //   wr.salary + currentLineupCost <=
        //     costOfCheapestPossibleRemainingPlayers
        // );
        return (
          !restrictedPassCatcherTeams.includes(wr.teamAbbrev) &&
          remainingSalaryAfterAddingWrAndCheapestRemainingPlayers >= 0
        );
      }) || null;

    return wideReceiver;
  }

  findDstThatFitsBudget(currentLineup: Lineup): Player | null {
    const { qb, rb1, rb2, wr1, wr2, wr3, te, flex, remainingSalary } =
      currentLineup;

    const restrictedDsts = [
      qb.opposingTeam,
      qb.teamAbbrev,
      rb1?.opposingTeam,
      rb2?.opposingTeam,
      wr1?.opposingTeam,
      wr2?.opposingTeam,
      wr3?.opposingTeam,
      te?.opposingTeam,
      flex?.opposingTeam,
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
    const maxNumberOfLineups = 90;
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

    // console.log('rbCombosWithDuplicates:', rbCombosWithDuplicates);

    return rbCombosWithDuplicates;
  }

  /*
   * If
   */
  generateQbPassCatcherPairings(): void {
    this.qbPool = this.qbPool.map((qb) => {
      const teamsInMatchup = qb.gameInfo.split('@');

      // console.log('teamsInMatchup', teamsInMatchup);
      const wrsInThisGame = this.wrPool.filter((wr) =>
        teamsInMatchup.includes(wr.teamAbbrev)
      );
      const tesInThisGame = this.tePool.filter((te) =>
        teamsInMatchup.includes(te.teamAbbrev)
      );
      const passCatcherPool: Player[] = [...wrsInThisGame, ...tesInThisGame];
      console.log(`passCatcherPool for ${qb.name}`, passCatcherPool);
      const passCatchersForQbsTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev === qb.teamAbbrev
      );
      console.log('passCatchersForQbsTeam', passCatchersForQbsTeam);
      const passCatchersFromOpposingTeam = passCatcherPool.filter(
        (player) => player.teamAbbrev !== qb.teamAbbrev
      );
      const passCatcherCombosWithoutOpponent: Player[][] = [];
      const passCatcherCombosIncludingOpponent: Player[][] = [];

      // Begin with pass catchers from QB's team
      for (
        let groupIndex = 0;
        groupIndex < passCatchersForQbsTeam.length - 1;
        groupIndex++
      ) {
        for (let i = groupIndex + 1; i < passCatchersForQbsTeam.length; i++) {
          passCatcherCombosWithoutOpponent.push([
            passCatchersForQbsTeam[groupIndex],
            passCatchersForQbsTeam[i],
          ]);
        }
      }

      if (qb.requirePassCatcherFromOpposingTeam) {
        for (
          let groupIndex = 0;
          groupIndex < passCatchersFromOpposingTeam.length - 1;
          groupIndex++
        ) {
          for (
            let i = 0;
            i < passCatcherCombosWithoutOpponent.length - 1;
            i++
          ) {
            passCatcherCombosIncludingOpponent.push([
              ...passCatcherCombosWithoutOpponent[i],
              passCatchersFromOpposingTeam[groupIndex],
            ]);
          }
        }

        console.log(
          'passCatcherCombosIncludingOpponent: ',
          passCatcherCombosIncludingOpponent
        );
      }

      console.log(
        `qbPassCatcherPairings for ${qb.name}:`,
        qb.requirePassCatcherFromOpposingTeam
          ? passCatcherCombosIncludingOpponent
          : passCatcherCombosWithoutOpponent
      );

      return {
        ...qb,
        qbPassCatcherPairings: qb.requirePassCatcherFromOpposingTeam
          ? passCatcherCombosIncludingOpponent
          : passCatcherCombosWithoutOpponent,
      };
    });
  }

  generateWrTeCombos(): void {
    console.log('Generate WR/TE Combos clicked');
  }
}
