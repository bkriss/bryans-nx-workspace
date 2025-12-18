import {
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  PlayerProjections,
  PlayerScoringProjection,
  RawDkPlayer,
} from '@bryans-nx-workspace/draftkings-shared';

const renderLastName = (fullName: string): string => {
  const brokenUpName = fullName.split(' ');

  let lastName = brokenUpName[1];
  if (brokenUpName.length === 3) {
    lastName = `${brokenUpName[1]} ${brokenUpName[2]}`;
  }

  return lastName;
};

const simplifyText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/ /g, '')
    .replace('d/st', '')
    .replace('jr', '')
    .replace('sr', '')
    .replace('ii', '')
    .replace('iii', '')
    .replace('mitchell', 'mitch');

const findDkPlayer = (
  playerFromScoringProjections: PlayerScoringProjection,
  rawDkPlayers: RawDkPlayer[],
  teamsInThisSlate: Set<string>
): Player | null => {
  const dkPlayer = rawDkPlayers.find((rawPlayer: RawDkPlayer) => {
    const teamAbbrev = rawPlayer.TeamAbbrev;

    const playerNameFromScoringProjections = simplifyText(
      playerFromScoringProjections.fullName
    );
    const playerNameFromDkSalaries = simplifyText(rawPlayer.Name);

    return (
      teamAbbrev === playerFromScoringProjections.teamAbbrev &&
      playerNameFromScoringProjections === playerNameFromDkSalaries
    );
  });

  let player: Player | null = null;

  if (
    !dkPlayer &&
    teamsInThisSlate.has(playerFromScoringProjections.teamAbbrev)
  ) {
    console.warn(
      `DK Player not found for ${playerFromScoringProjections.fullName} - ${playerFromScoringProjections.teamAbbrev}`
    );
    return null;
  }

  if (dkPlayer) {
    const firstName = dkPlayer.Name.split(' ')[0];
    const lastName = renderLastName(dkPlayer.Name);
    const nameAbbrev =
      dkPlayer.Position !== 'DST'
        ? `${firstName?.[0]}. ${lastName}`
        : dkPlayer.Name;
    const gameInfo = dkPlayer['Game Info'].split(' ')[0];
    const opposingTeamAbbrev =
      gameInfo.split('@')[0] !== dkPlayer.TeamAbbrev
        ? gameInfo.split('@')[0]
        : gameInfo.split('@')[1];

    const name = dkPlayer.Name;
    const salary = parseInt(dkPlayer.Salary, 10);
    const teamAbbrev = dkPlayer.TeamAbbrev;

    const projectedPointsAvg =
      playerFromScoringProjections?.projectedPointsAvg ?? 0;
    const projectedPointsEspn =
      playerFromScoringProjections?.projectedPointsEspn ?? 0;
    const projectedPointsFantasyFootballers =
      playerFromScoringProjections?.projectedPointsFantasyFootballers ?? 0;
    const projectedPointsPerDollar = Number(
      ((projectedPointsAvg / salary) * 100).toFixed(4)
    );

    player = {
      gameInfo,
      gradeOutOfTen: 0,
      id: dkPlayer.ID,
      isSelectedForPlayerPool: false,
      maxOwnershipPercentage: 0,
      minOwnershipPercentage: 0,
      name,
      nameAbbrev,
      opposingTeamAbbrev,
      position: dkPlayer.Position,
      projectedPointsAvg,
      projectedPointsEspn,
      projectedPointsFantasyFootballers,
      projectedPointsPerDollar,
      salary,
      teamAbbrev,
    };
  }

  return player;
};

export const draftKingsPlayersWithScoringProjections = (
  rawDkPlayers: RawDkPlayer[],
  projections: PlayerProjections | null
) => {
  const availablePlayers = {
    quarterbacks: [] as Quarterback[],
    runningBacks: [] as RunningBack[],
    wideReceivers: [] as PassCatcher[],
    tightEnds: [] as PassCatcher[],
    defenses: [] as Player[],
  };

  if (!rawDkPlayers?.length || !projections) return availablePlayers;

  const teamsInThisSlate = new Set<string>();
  rawDkPlayers.forEach((player) => {
    teamsInThisSlate.add(player.TeamAbbrev);
  });

  projections.quarterbacks.forEach((qb) => {
    const player = findDkPlayer(qb, rawDkPlayers, teamsInThisSlate);

    if (player) {
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
      availablePlayers.quarterbacks.push(quarterback);
    }
  });

  projections.runningBacks.forEach((rb) => {
    const player = findDkPlayer(rb, rawDkPlayers, teamsInThisSlate);
    if (player) {
      const runningBack: RunningBack = {
        ...player,
        allowOnlyAsFlex: false,
        allowRBFromOpposingTeam: false,
        maxOwnershipPercentage: 35,
        minOwnershipPercentage: 10,
        useAsAlternate: false,
      };

      availablePlayers.runningBacks.push(runningBack);
    }
  });

  projections.wideReceivers.forEach((wr) => {
    const player = findDkPlayer(wr, rawDkPlayers, teamsInThisSlate);
    if (player) {
      const passCatcher: PassCatcher = {
        ...player,
        maxOwnershipPercentage: 0,
        minOwnershipPercentage: 0,
        maxOwnershipWhenPairedWithQb: 0,
        minOwnershipWhenPairedWithQb: 0,
        maxOwnershipWhenPairedWithOpposingQb: 0,
        minOwnershipWhenPairedWithOpposingQb: 0,
        onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
        onlyUseInLargerFieldContests: false,
      };

      availablePlayers.wideReceivers.push(passCatcher);
    }
  });

  projections.tightEnds.forEach((te) => {
    const player = findDkPlayer(te, rawDkPlayers, teamsInThisSlate);
    if (player) {
      const passCatcher: PassCatcher = {
        ...player,
        maxOwnershipPercentage: 0,
        minOwnershipPercentage: 0,
        maxOwnershipWhenPairedWithQb: 0,
        minOwnershipWhenPairedWithQb: 0,
        maxOwnershipWhenPairedWithOpposingQb: 0,
        minOwnershipWhenPairedWithOpposingQb: 0,
        onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: false,
        onlyUseInLargerFieldContests: false,
      };

      availablePlayers.tightEnds.push(passCatcher);
    }
  });

  projections.dsts.forEach((dst) => {
    const player = findDkPlayer(dst, rawDkPlayers, teamsInThisSlate);
    if (player) {
      availablePlayers.defenses.push(player);
    }
  });

  return availablePlayers;
};
