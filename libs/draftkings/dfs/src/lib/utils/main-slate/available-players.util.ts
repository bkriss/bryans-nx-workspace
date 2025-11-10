import { earlyOnlySalaries } from '../early-only/salaries';
// import { mainSlateSalaries } from './salaries';
import { PassCatcher, Player, Quarterback, RunningBack } from '../../models';
import { csvToJson } from '../csv-to-json.util';

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

const renderLastName = (fullName: string): string => {
  const brokenUpName = fullName.split(' ');

  let lastName = brokenUpName[1];
  if (brokenUpName.length === 3) {
    lastName = `${brokenUpName[1]} ${brokenUpName[2]}`;
  }

  return lastName;
};

// export const draftKingsPlayers = csvToJson(mainSlateSalaries).map(
export const draftKingsPlayers = csvToJson(earlyOnlySalaries).map(
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
      allowOnlyAsFlex: false,
      allowRBFromOpposingTeam: false,
      maxOwnershipPercentage: 35,
      minOwnershipPercentage: 10,
      useAsAlternate: false,
    };

    const quarterback: Quarterback = {
      ...player,
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 1,
      maxOwnershipPercentage: 100,
      minOwnershipPercentage: 100,
      numberOfLineupsWithThisPlayer: 10,
      passCatcherStacks: [],
      requirePassCatcherFromOpposingTeam: true,
      sortOrder: 0,
    };

    const passCatcher: PassCatcher = {
      ...player,
      maxOwnershipPercentage: 25,
      minOwnershipPercentage: 5,
      maxOwnershipWhenPairedWithQb: 70,
      minOwnershipWhenPairedWithQb: 50,
      maxOwnershipWhenPairedWithOpposingQb: 60,
      minOwnershipWhenPairedWithOpposingQb: 50,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
      onlyUseInLargerFieldContests: false,
    };

    if (player.position === 'QB') {
      return quarterback;
    }

    if (player.position === 'RB') {
      return runningBack;
    }

    if (player.position === 'WR' || player.position === 'TE') {
      return passCatcher;
    }

    return player;
  }
);

const availableQuarterbacks = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'QB')
    .slice(0, numberOfTeams)
    .map((player) => ({
      ...player,
      maxNumberOfTeammatePasscatchers: 2,
      minNumberOfTeammatePasscatchers: 1,
      numberOfLineupsWithThisPlayer: 0,
      passCatcherStacks: [],
      requirePassCatcherFromOpposingTeam: true,
      sortOrder: 0,
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
    })) as PassCatcher[];
const availableTightEnds = (numberOfTeams: number) =>
  draftKingsPlayers
    .filter((player) => player.position === 'TE')
    .slice(0, numberOfTeams)
    .map((player) => ({
      ...player,
      onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
    })) as PassCatcher[];
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
