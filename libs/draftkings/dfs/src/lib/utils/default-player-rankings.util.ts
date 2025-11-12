import { Position, Slate } from '../enums';

interface PlayerProjections {
  name: string;
  teamAbbrev: string;
  salary: number;
  projectedPoints: number;
}

export const quarterbackProjections: PlayerProjections[] = [];

export const runningBackProjections: PlayerProjections[] = [
  {
    name: 'Christian McCaffrey',
    projectedPoints: 23,
    salary: 9000,
    teamAbbrev: 'SF',
  },
  {
    name: 'James Cook III',
    projectedPoints: 21,
    salary: 7500,
    teamAbbrev: 'BUF',
  },
  {
    name: "De'Von Achane",
    projectedPoints: 20,
    salary: 7400,
    teamAbbrev: 'MIA',
  },
  {
    name: 'Jahmyr Gibbs',
    projectedPoints: 17,
    salary: 8000,
    teamAbbrev: 'DET',
  },
  { name: 'Josh Jacobs', projectedPoints: 17, salary: 7600, teamAbbrev: 'GB' },
  { name: 'Rico Dowdle', projectedPoints: 17, salary: 6300, teamAbbrev: 'CAR' },
  {
    name: 'Derrick Henry',
    projectedPoints: 16,
    salary: 6800,
    teamAbbrev: 'BAL',
  },
  {
    name: 'Rachaad White',
    projectedPoints: 15,
    salary: 6400,
    teamAbbrev: 'TB',
  },
  {
    name: 'Saquon Barkley',
    projectedPoints: 15,
    salary: 7800,
    teamAbbrev: 'PHI',
  },
  {
    name: 'Kyren Williams',
    projectedPoints: 15,
    salary: 6600,
    teamAbbrev: 'LAR',
  },
  {
    name: 'Jaylen Warren',
    projectedPoints: 14,
    salary: 5800,
    teamAbbrev: 'PIT',
  },
  {
    name: 'Quinshon Judkins',
    projectedPoints: 14,
    salary: 6500,
    teamAbbrev: 'CLE',
  },
  { name: 'Breece Hall', projectedPoints: 13, salary: 6000, teamAbbrev: 'NYJ' },
  {
    name: "D'Andre Swift",
    projectedPoints: 13,
    salary: 6100,
    teamAbbrev: 'CHI',
  },
  {
    name: 'David Montgomery',
    projectedPoints: 12,
    salary: 5000,
    teamAbbrev: 'DET',
  },
  {
    name: 'TreVeyon Henderson',
    projectedPoints: 12,
    salary: 5600,
    teamAbbrev: 'NE',
  },
  {
    name: 'Kenneth Walker III',
    projectedPoints: 12,
    salary: 5300,
    teamAbbrev: 'SEA',
  },
  { name: 'Alvin Kamara', projectedPoints: 11, salary: 5400, teamAbbrev: 'NO' },
  {
    name: 'Tyrone Tracy Jr.',
    projectedPoints: 11,
    salary: 5800,
    teamAbbrev: 'NYG',
  },
  {
    name: 'Travis Etienne Jr.',
    projectedPoints: 11,
    salary: 5700,
    teamAbbrev: 'JAX',
  },
  {
    name: 'Aaron Jones Sr.',
    projectedPoints: 11,
    salary: 5200,
    teamAbbrev: 'MIN',
  },
  {
    name: 'Kyle Monangai',
    projectedPoints: 11,
    salary: 5600,
    teamAbbrev: 'CHI',
  },
  {
    name: 'Kimani Vidal',
    projectedPoints: 11,
    salary: 5900,
    teamAbbrev: 'LAC',
  },
];

export const wideReceiverProjections: PlayerProjections[] = [];

export const tightEndProjections: PlayerProjections[] = [];

export const dstProjections: PlayerProjections[] = [];

export const defaultPlayerRankings = (
  position: Position,
  slate: Slate
): {
  name: string;
  playerValue: number;
}[] => {
  const thursdayTeams = ['NYJ', 'NE'];
  const sundayMorningTeams = ['WAS', 'MIA'];
  const sundayEveningTeams = ['SF', 'ARI', 'BAL', 'CLE', 'KC', 'DEN'];
  const sundayNightTeams = ['DET', 'PHI'];
  const mondayNightTeams = ['DAL', 'LV'];
  const invalidTeamsForEarlyOnly = [
    ...thursdayTeams,
    ...sundayMorningTeams,
    ...sundayEveningTeams,
    ...sundayNightTeams,
    ...mondayNightTeams,
  ];
  const invalidTeamsForMainSlate = [
    ...thursdayTeams,
    ...sundayMorningTeams,
    ...sundayNightTeams,
    ...mondayNightTeams,
  ];

  let rankings = [...quarterbackProjections];

  if (position === Position.RB) {
    rankings = [...runningBackProjections];
  } else if (position === Position.WR) {
    rankings = [...wideReceiverProjections];
  } else if (position === Position.TE) {
    rankings = [...tightEndProjections];
  } else if (position === Position.DST) {
    rankings = [...dstProjections];
  }

  if (slate === Slate.EARLY_ONLY) {
    rankings = rankings.filter((player) => {
      // Filter out players based on teamAbbrev for early-only slate
      return !invalidTeamsForEarlyOnly.includes(player.teamAbbrev);
    });
  } else if (slate === Slate.MAIN) {
    rankings = rankings.filter((player) => {
      // Filter out players based on teamAbbrev for main slate
      return !invalidTeamsForMainSlate.includes(player.teamAbbrev);
    });
  }

  return rankings
    .map((receiver) => {
      const { name, projectedPoints, salary } = receiver;
      const playerValue = Number(((projectedPoints / salary) * 100).toFixed(4));
      return {
        name,
        playerValue,
      };
    })
    .sort((a, b) => (b.playerValue || 0) - (a.playerValue || 0));
};
