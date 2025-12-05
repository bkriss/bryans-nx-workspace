import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  PlayerProjections,
  Position,
} from '@bryans-nx-workspace/draftkings-shared';
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

export const draftKingsPlayersWithScoringProjections = (
  playerSalaries: string,
  projections: PlayerProjections | null
) => {
  console.log('draftKingsPlayersWithScoringProjections called 1');
  const availablePlayers = {
    quarterbacks: [] as Quarterback[],
    runningBacks: [] as RunningBack[],
    wideReceivers: [] as PassCatcher[],
    tightEnds: [] as PassCatcher[],
    defenses: [] as Player[],
  };

  if (!playerSalaries?.length || !projections) return availablePlayers;

  console.log('draftKingsPlayersWithScoringProjections called 2');

  csvToJson(playerSalaries).forEach((rawPlayer: RawPlayer) => {
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

    const playerProjections = [
      ...projections.quarterbacks,
      ...projections.runningBacks,
      ...projections.wideReceivers,
      ...projections.tightEnds,
      ...projections.dsts,
    ];

    const name = rawPlayer.Name;
    const salary = parseInt(rawPlayer.Salary, 10);
    const teamAbbrev = rawPlayer.TeamAbbrev;

    const matchedPlayerFromDkAndProjections = playerProjections.find(
      (playerFromProjections) =>
        teamAbbrev === playerFromProjections.teamAbbrev &&
        playerFromProjections.fullName.includes(name)
    );

    if (!matchedPlayerFromDkAndProjections) {
      console.warn(
        `Couldn't find scoring projection for: ${name} (${teamAbbrev})`
      );
    }

    const projectedPoints =
      matchedPlayerFromDkAndProjections?.projectedPoints ?? 0;

    const projectedPointsPerDollar = Number(
      ((projectedPoints / salary) * 100).toFixed(4)
    );

    const player: Player = {
      gameInfo,
      gradeOutOfTen: 0,
      id: rawPlayer.ID,
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 30,
      minOwnershipPercentage: 10,
      name,
      nameAbbrev,
      opposingTeamAbbrev,
      position: rawPlayer.Position,
      projectedPointsPerDollar,
      salary,
      teamAbbrev,
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
      maxNumberOfTeammatePasscatchers: 1,
      minNumberOfTeammatePasscatchers: 1,
      maxOwnershipPercentage: 100,
      minOwnershipPercentage: 100,
      numberOfLineupsWithThisPlayer: 10,
      passCatcherStacks: [],
      requirePlayerFromOpposingTeam: true,
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

    if (player.position === Position.QB) {
      // return quarterback;
      availablePlayers.quarterbacks.push(quarterback);
    }

    if (player.position === Position.RB) {
      availablePlayers.runningBacks.push(runningBack);
      // return runningBack;
    }

    if (player.position === Position.WR) {
      availablePlayers.wideReceivers.push(passCatcher);
    }

    if (player.position === Position.TE) {
      availablePlayers.tightEnds.push(passCatcher);
    }

    if (player.position === Position.DST) {
      availablePlayers.defenses.push(player);
    }

    // return player;
  });

  return availablePlayers;
};
