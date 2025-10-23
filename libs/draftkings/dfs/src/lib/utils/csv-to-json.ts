import { salaries } from './salaries';
import {
  Player,
  Quarterback,
  RunningBack,
  TightEnd,
  WideReceiver,
} from '../models';

interface RawPlayer {
  AvgPointsPerGame: string;
  'Game Info': string;
  ID: string;
  Name: string;
  'Name + ID': string;
  Position: string;
  'Roster Position': string;
  Salary: string;
  TeamAbbrev: string;
}

export const csvToJson = (csvString: string) => {
  const rows = csvString.split('\n');
  const headers = rows[0].split(',');
  const jsonData = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',');
    // const obj: Player = {
    //   AvgPointsPerGame: '',
    //   'Game Info': '',
    //   ID: '',
    //   Name: '',
    //   'Name + ID': '',
    //   Position: '',
    //   'Roster Position': '',
    //   Salary: '',
    //   TeamAbbrev: '',
    // };
    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      const value = values[j] ? values[j].trim() : ''; // Handle potential missing values
      obj[key] = value;
    }

    // console.log('Row Object:', obj); // Debugging line to inspect each row object
    jsonData.push(obj);
  }
  //   return JSON.stringify(jsonData); // Returns a JSON string

  return jsonData;
};

const renderLastName = (fullName: string): string => {
  const brokenUpName = fullName.split(' ');

  let lastName = brokenUpName[1];
  if (brokenUpName.length === 3) {
    lastName = `${brokenUpName[1]} ${brokenUpName[2]}`;
  }

  return lastName;
};

export const draftKingsPlayers = csvToJson(salaries).map(
  (rawPlayer: RawPlayer) => {
    const firstName = rawPlayer.Name.split(' ')[0];
    const lastName = renderLastName(rawPlayer.Name);
    const nameAbbrev =
      rawPlayer.Position !== 'DST'
        ? `${firstName?.[0]}. ${lastName}`
        : rawPlayer.Name;
    const gameInfo = rawPlayer['Game Info'].split(' ')[0];
    const opposingTeamAbbrev =
      gameInfo.split('@')[0] !== rawPlayer.TeamAbbrev
        ? gameInfo.split('@')[0]
        : gameInfo.split('@')[1];

    const player: Player = {
      gameInfo,
      gradeOutOfTen: 0,
      id: rawPlayer.ID,
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name: rawPlayer.Name,
      nameAbbrev,
      opposingTeamAbbrev,
      position: rawPlayer.Position,
      salary: parseInt(rawPlayer.Salary, 10),
      teamAbbrev: rawPlayer.TeamAbbrev,
    };

    const runningBack: RunningBack = {
      ...player,
      allowRBFromOpposingTeam: false,
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
    };

    const quarterback: Quarterback = {
      ...player,
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 1,
      maxOwnershipPercentage: 100,
      minOwnershipPercentage: 100,
      numberOfLineupsWithThisPlayer: 10,
      requirePassCatcherFromOpposingTeam: true,
      qbPassCatcherPairings: [],
    };

    const wideReceiver: WideReceiver = {
      ...player,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    };

    const tightEnd: TightEnd = {
      ...player,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      maxOwnershipWhenPairedWithQb: 80,
      minOwnershipWhenPairedWithQb: 20,
      maxOwnershipWhenPairedWithOpposingQb: 65,
      minOwnershipWhenPairedWithOpposingQb: 20,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    };

    if (player.position === 'QB') {
      return quarterback;
    }

    if (player.position === 'RB') {
      return runningBack;
    }

    if (player.position === 'WR') {
      return wideReceiver;
    }

    if (player.position === 'TE') {
      return tightEnd;
    }

    return player;
  }
);

// export const draftKingsPlayers = () => {
//   //   return JSON.parse(csvToJson(salaries));
//   return csvToJson(salaries);
// };

// const csvData = 'name,age,city\nAlice,30,New York\nBob,25,London';
// const jsonData = csvToJson(csvData);
// console.log(jsonData);

const availableQuarterbacks = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'QB')
    .slice(0, numberOfTeams)
    .map((player) => ({
      ...player,
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 1,
      numberOfLineupsWithThisPlayer: 0,
      requirePassCatcherFromOpposingTeam: true,
      qbPassCatcherPairings: [],
    })) as Quarterback[];

const availableRunningBacks = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'RB')
    .slice(0, numberOfTeams * 2) as RunningBack[];
const availableWideReceivers = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'WR')
    .slice(0, numberOfTeams * 4)
    .map((player) => ({
      ...player,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    })) as WideReceiver[];
const availableTightEnds = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'TE')
    .slice(0, numberOfTeams)
    .map((player) => ({
      ...player,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    })) as TightEnd[];
const availableDefenses = draftKingsPlayers.filter(
  (player) => player.position === 'DST'
) as Player[];

export const getAvailablePlayers = (numberOfTeams: number) => {
  const qbs = availableQuarterbacks(numberOfTeams);
  const rbs = availableRunningBacks(numberOfTeams);
  const wrs = availableWideReceivers(numberOfTeams);
  const tes = availableTightEnds(numberOfTeams);
  const dsts = availableDefenses;

  return { qbs, rbs, wrs, tes, dsts };
};
