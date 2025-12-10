import {
  csvToJson,
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  PlayerProjections,
  Position,
} from '@bryans-nx-workspace/draftkings-shared';

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

  const teamsPlayingInThisSlate: Set<string> = new Set<string>();
  const playerSalariesJson = csvToJson(playerSalaries);
  playerSalariesJson.forEach((line: RawPlayer) => {
    teamsPlayingInThisSlate.add(line.TeamAbbrev);
  });

  console.log('playerSalariesJson length: ', playerSalariesJson.length);

  // TODO: Separate this by position and then slice it so that we limit the number of players we're looping through (currently going though 566)

  playerSalariesJson.forEach((rawPlayer: RawPlayer) => {
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
      (playerFromProjections) => {
        // TODO: Add replace method for Jr., Sr., III, etc.
        // TODO: Add replace method for D/ST so that we can stop using includes
        const playerNameFromEspnProjections = playerFromProjections.fullName
          .toLowerCase()
          .replace(/\./g, '')
          .replace(/ /g, '')
          .replace('d/st', '')
          .replace('jr', '')
          .replace('sr', '')
          .replace('iii', '');
        const playerNameFromDkSalaries = name
          .toLowerCase()
          .replace(/\./g, '')
          .replace(/ /g, '')
          .replace('d/st', '')
          .replace('jr', '')
          .replace('sr', '')
          .replace('iii', '');

        return (
          teamAbbrev === playerFromProjections.teamAbbrev &&
          playerNameFromEspnProjections.includes(playerNameFromDkSalaries)
        );
      }
    );

    // if (
    //   !matchedPlayerFromDkAndProjections &&
    //   teamsPlayingInThisSlate.has(teamAbbrev)
    // ) {
    //   console.warn(
    //     `Couldn't find scoring projection for: ${name} (${teamAbbrev})`
    //   );
    // }

    const projectedPointsAvg =
      matchedPlayerFromDkAndProjections?.projectedPointsAvg ?? 0;
    const projectedPointsEspn =
      matchedPlayerFromDkAndProjections?.projectedPointsEspn ?? 0;
    const projectedPointsFantasyFootballers =
      matchedPlayerFromDkAndProjections?.projectedPointsFantasyFootballers ?? 0;

    const projectedPointsPerDollar = Number(
      ((projectedPointsAvg / salary) * 100).toFixed(4)
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
      projectedPointsAvg,
      projectedPointsEspn,
      projectedPointsFantasyFootballers,
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
