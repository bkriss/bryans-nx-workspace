import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
// import type {
//   FantasyFootballersProjections,
//   MappedFantasyFootballersPlayer,
// } from '@bryans-nx-workspace/draftkings-shared';

const admin = require('firebase-admin');
admin.initializeApp();

// Global options for all v2 functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
  timeoutSeconds: 30,
});

interface EspnPlayerStats {
  appliedTotal: number;
  externalId: string;
  id: string;
  proTeamId: number;
  scoringPeriodId: number;
  seasonId: number;
  statSourceId: number;
  statSplitTypeId: number;
}

interface EspnPlayer {
  active: boolean;
  defaultPositionId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  proTeamId: number;
  stats: EspnPlayerStats[];
  id: number;
}

interface EspnPlayerData {
  player: EspnPlayer;
}

type FantasyFilter = {
  players: {
    filterStatus?: { value: string[] };
    filterSlotIds?: { value: number[] };
    filterRanksForScoringPeriodIds: { value: number[] };
    sortPercOwned?: { sortAsc: boolean; sortPriority: number };
    limit?: number;
    offset?: number;
    sortDraftRanks: {
      sortPriority: number;
      sortAsc: boolean;
      value: string;
    };
    filterRanksForRankTypes: { value: string[] };
    filterRanksForSlotIds: { value: number[] };
    filterStatsForTopScoringPeriodIds: {
      value: number;
      additionalValue: string[];
    };
  };
};

interface FantasyFootballersProjections {
  quarterbacks: MappedFantasyFootballersPlayer[];
  runningBacks: MappedFantasyFootballersPlayer[];
  wideReceivers: MappedFantasyFootballersPlayer[];
  tightEnds: MappedFantasyFootballersPlayer[];
  defenses: MappedFantasyFootballersPlayer[];
}

interface MappedFantasyFootballersPlayer {
  id: string;
  name: string;
  projectedPoints: number;
  teamAbbrev: string;
}

function buildFantasyFilter(
  season: number,
  week: number,
  limit = 750
): FantasyFilter {
  return {
    players: {
      filterStatus: { value: ['FREEAGENT', 'WAIVERS'] },
      filterSlotIds: { value: [0, 2, 4, 6, 16] }, // QB,RB,WR,TE,DST
      filterRanksForScoringPeriodIds: { value: [week] },
      limit,
      offset: 0,
      sortPercOwned: { sortAsc: false, sortPriority: 1 },
      sortDraftRanks: { sortPriority: 100, sortAsc: true, value: 'STANDARD' },
      filterRanksForRankTypes: { value: ['PPR'] },
      filterRanksForSlotIds: {
        value: [0, 2, 4, 6, 17, 16, 8, 9, 10, 12, 13, 24, 11, 14, 15],
      },
      filterStatsForTopScoringPeriodIds: {
        value: 2,
        additionalValue: [
          '002025',
          '102025',
          '002024',
          `11${season}${week}`,
          '022025',
        ],
      },
    },
  };
}

const findTeamAbbrev = (proTeamId: number): string => {
  const teamAbbrevs: { [key: number]: string } = {
    1: 'ATL',
    2: 'BUF',
    3: 'CHI',
    4: 'CIN',
    5: 'CLE',
    6: 'DAL',
    7: 'DEN',
    8: 'DET',
    9: 'GB',
    10: 'TEN',
    11: 'IND',
    12: 'KC',
    13: 'LV',
    14: 'LAR',
    15: 'MIA',
    16: 'MIN',
    17: 'NE',
    18: 'NO',
    19: 'NYG',
    20: 'NYJ',
    21: 'PHI',
    22: 'ARI',
    23: 'PIT',
    24: 'LAC',
    25: 'SF',
    26: 'SEA',
    27: 'TB',
    28: 'WAS',
    29: 'CAR',
    30: 'JAX',
    31: 'Unknown',
    32: 'Unknown',
    33: 'BAL',
    34: 'HOU',
  };
  return teamAbbrevs[proTeamId] || 'Unknown';
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

export const simplifyEspnReturnData = (
  espnPlayerData: EspnPlayerData[],
  week: number,
  fantasyFootballersProjections?: FantasyFootballersProjections
) => {
  const { quarterbacks, runningBacks, wideReceivers, tightEnds, defenses } =
    fantasyFootballersProjections || {};

  // TODO: Refactor simplifyEspnReturnData to be more efficient. Reference available-players.util.ts for ideas.
  const fantasyFootballersPlayerProjections =
    [] as MappedFantasyFootballersPlayer[];
  if (quarterbacks?.length) {
    fantasyFootballersPlayerProjections.push(...quarterbacks);
  }
  if (runningBacks?.length) {
    fantasyFootballersPlayerProjections.push(...runningBacks);
  }
  if (wideReceivers?.length) {
    fantasyFootballersPlayerProjections.push(...wideReceivers);
  }
  if (tightEnds?.length) {
    fantasyFootballersPlayerProjections.push(...tightEnds);
  }
  if (defenses?.length) {
    fantasyFootballersPlayerProjections.push(
      ...defenses.map((defense) => ({
        ...defense,
        name: defense.name.split(' ')[1], // Use "Vikings" instead of "Minnesota Vikings"
      }))
    );
  }

  return espnPlayerData
    .map((item) => {
      const { player } = item;

      const espnProjectedPoints = player.stats?.find(
        (stat) => stat.scoringPeriodId === week && stat.statSourceId === 1
      )?.appliedTotal;

      const fantasyFootballersPlayer = fantasyFootballersPlayerProjections.find(
        (p) => {
          const playerNameFromEspnProjections = simplifyText(player.fullName);
          const playerNameFromFantasyFootballersProjections = simplifyText(
            p.name
          );
          return (
            playerNameFromEspnProjections ===
            playerNameFromFantasyFootballersProjections
          );
        }
      );

      if (!fantasyFootballersPlayer) {
        logger.warn(
          `No DFS Pass projection found for player: ${player.fullName}`
        );
      }

      let averageProjectedPoints = 0;
      if (espnProjectedPoints && fantasyFootballersPlayer?.projectedPoints) {
        averageProjectedPoints =
          (espnProjectedPoints + fantasyFootballersPlayer.projectedPoints) / 2;
      } else if (espnProjectedPoints) {
        averageProjectedPoints = espnProjectedPoints;
      } else if (fantasyFootballersPlayer?.projectedPoints) {
        averageProjectedPoints = fantasyFootballersPlayer.projectedPoints;
      }

      return {
        fullName: player.fullName,
        firstName: player.firstName,
        id: player.id,
        lastName: player.lastName,
        position: findPosition(player.defaultPositionId),
        projectedPointsAvg: averageProjectedPoints,
        projectedPointsEspn: espnProjectedPoints || 0,
        projectedPointsFantasyFootballers:
          fantasyFootballersPlayer?.projectedPoints || 0,
        teamAbbrev: findTeamAbbrev(player.proTeamId),
      };
    })
    .sort((a, b) => b.projectedPointsAvg - a.projectedPointsAvg);
};

const findPosition = (positionId: number): string => {
  const positionMap: { [key: number]: string } = {
    1: 'QB',
    2: 'RB',
    3: 'WR',
    4: 'TE',
    16: 'DST',
  };
  return positionMap[positionId];
};

export const playerScoringProjections = onCall(async (request) => {
  const payload = request.data.query as {
    limit: number;
    numberOfTeams: number;
    season: number;
    week: number;
  };

  const leagueId = 648971614;
  const limit = payload.limit;
  const numberOfTeams = payload.numberOfTeams;
  const season = payload.season;
  const week = payload.week;
  const s2 =
    'AECYIdEMl7ompig%2FI1CVi1ke8kX7u8VQ7Doo7l1ICSRCDqhg%2FHV8buAmqfjTXKFAQtvqJtGzMY5HPsc8%2FCXXJCbsfjX1YaPCEbt%2BQf6Boi3FoKmgFhH1iCDuziRn7cTgwcvsdjLYQI8XRXOpRrVbsNrySOqHJUwOEkXwOySdEPUmH4FUEhMvTxzzzjv5Vz8paNNdQN67PnSYifAePEgu2hA9YgWtiwGPr0pEKe%2FomM0BG9lMOrs72xb%2F%2FxuaYyNfY7E1%2FaWYzYZ3AMrUWbFpK9Ex1WaDuyaEmCr887imPaxGLg%3D%3D';
  const swid = '{F9A0366F-B19B-4481-AA52-06D9FC8634CA}';

  if (!season || !week || !numberOfTeams) {
    logger.error(
      'Invalid argument: season, week, and numberOfTeams are required.'
    );
    throw new HttpsError(
      'invalid-argument',
      'The "season", "week", and "numberOfTeams" fields are required.'
    );
  }

  try {
    const host = 'https://lm-api-reads.fantasy.espn.com';
    const path = `/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}/players?scoringPeriodId=${week}&view=kona_player_info&platformVersion=d79639d0989d93b7a7ecbd5f90925b437f3767e0`;
    const apiUrl = `${host}${path}`;
    const filter = buildFantasyFilter(season, week, limit);
    const cookieHeader = `espn_s2=${s2}; SWID=${swid};`;
    const headers = {
      'x-fantasy-filter': JSON.stringify(filter),
      accept: 'application/json, text/plain, */*',
      cookie: cookieHeader,
      // Help avoid HTML interstitials or bot pages
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      origin: 'https://fantasy.espn.com',
      referer: `https://fantasy.espn.com/football/players/add?leagueId=${leagueId}`,
      'accept-language': 'en-US,en;q=0.9',
    };

    logger.info(`Fetching data from: ${apiUrl}`);

    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const contentType = resp.headers.get('content-type') || '';

    if (!resp.ok) {
      const text = await resp.text();
      logger.error('ESPN request failed', {
        status: resp.status,
        contentType,
        textSnippet: text?.slice(0, 500),
      });
      return {
        error: `Upstream error: ${resp.status}`,
        contentType,
        textSnippet: text?.slice(0, 500),
      };
    }

    const projectionsDocRef = admin
      .firestore()
      .collection('projections')
      .doc('draftKings');
    const fantasyFootballersProjections = await projectionsDocRef.get();
    const data = (await resp.json()) as EspnPlayerData[];
    const simplifiedData = simplifyEspnReturnData(
      data,
      week,
      fantasyFootballersProjections.data()
    );

    const quarterbacks = simplifiedData
      .filter((p) => p.position === 'QB')
      .slice(0, numberOfTeams);
    const runningBacks = simplifiedData
      .filter((p) => p.position === 'RB')
      .slice(0, numberOfTeams);
    const wideReceivers = simplifiedData
      .filter((p) => p.position === 'WR')
      .slice(0, numberOfTeams * 3);
    const tightEnds = simplifiedData
      .filter((p) => p.position === 'TE')
      .slice(0, numberOfTeams);
    const dsts = simplifiedData
      .filter((p) => p.position === 'DST')
      .slice(0, numberOfTeams);

    return { quarterbacks, runningBacks, wideReceivers, tightEnds, dsts };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Unknown error';
    logger.error('espnProjections crashed', { error: message });
    return { error: message };
  }
});
