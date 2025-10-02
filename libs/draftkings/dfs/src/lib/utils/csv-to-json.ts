import { salaries } from './salaries';
import { Player, Quarterback, TightEnd, WideReceiver } from '../models';

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

export const draftKingsPlayers = csvToJson(salaries).map(
  (player: RawPlayer) => {
    const firstName = player.Name.split(' ')[0];
    const lastName = player.Name.split(' ')[1];
    const nameAbbrev = `${firstName?.[0]}. ${lastName}`;
    const gameInfo = player['Game Info'].split(' ')[0];
    const opposingTeam =
      gameInfo.split('@')[0] !== player.TeamAbbrev
        ? gameInfo.split('@')[0]
        : gameInfo.split('@')[1];

    return {
      gameInfo,
      id: player.ID,
      name: player.Name,
      nameAbbrev,
      position: player.Position,
      salary: parseInt(player.Salary, 10),
      teamAbbrev: player.TeamAbbrev,
      opposingTeam,
      // avgPointsPerGame: parseFloat(player.AvgPointsPerGame),
    };
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
    .slice(0, numberOfTeams * 2) as Player[];
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
