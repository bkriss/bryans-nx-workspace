import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

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
    sortAppliedStatTotalForScoringPeriodId?: {
      sortPriority: number;
      sortAsc: boolean;
      value: number;
    };
    limit?: number;
    offset?: number;
    sortAppliedStatTotal: {
      sortAsc: boolean;
      sortPriority: number;
      value: string;
    };
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

function buildFantasyFilter(
  season: number,
  week: number,
  limit = 1000
): FantasyFilter {
  return {
    players: {
      filterStatus: { value: ['FREEAGENT', 'WAIVERS'] },
      filterSlotIds: { value: [0, 2, 4, 6, 16] }, // QB,RB,WR,TE,DST
      filterRanksForScoringPeriodIds: { value: [week] },
      limit,
      offset: 0,
      sortAppliedStatTotal: {
        sortAsc: false,
        sortPriority: 1,
        value: `11${season}${week}`, // TODO: Set the first 2 digits dynamically once we know how. Is it the month?
      },
      sortDraftRanks: { sortPriority: 100, sortAsc: true, value: 'STANDARD' },
      filterRanksForRankTypes: { value: ['PPR'] },
      filterRanksForSlotIds: {
        value: [0, 2, 4, 6, 17, 16, 8, 9, 10, 12, 13, 24, 11, 14, 15],
      },
      filterStatsForTopScoringPeriodIds: {
        value: 2,
        additionalValue: ['002025', '102025', '002024', '11202511', '022025'],
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
    31: '',
    32: '',
    33: 'BAL',
    34: 'HOU',
  };
  return teamAbbrevs[proTeamId] || 'Unknown';
};

export const simplifyEspnReturnData = (
  espnPlayerData: EspnPlayerData[],
  week: number
) => {
  return espnPlayerData
    .map((item) => {
      const { player } = item;

      const appliedTotal = player.stats?.find(
        (stat) => stat.scoringPeriodId === week && stat.statSourceId === 1
      )?.appliedTotal;

      return {
        fullName: player.fullName,
        firstName: player.firstName,
        id: player.id,
        lastName: player.lastName,
        position: findPosition(player.defaultPositionId),
        projectedPoints: appliedTotal || 0,
        teamAbbrev: findTeamAbbrev(player.proTeamId),
      };
    })
    .sort((a, b) => b.projectedPoints - a.projectedPoints);
};

// const findPosition = (positionId: number): Position => {
//   const positionMap: { [key: number]: Position } = {
//     1: Position.QB,
//     2: Position.RB,
//     3: Position.WR,
//     4: Position.TE,
//     16: Position.DST,
//   };
//   return positionMap[positionId];
// };
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
    season: number;
    week: number;
  };

  const leagueId = 648971614;
  const season = payload.season;
  const week = payload.week;
  const limit = payload.limit;
  const s2 =
    'AECYIdEMl7ompig%2FI1CVi1ke8kX7u8VQ7Doo7l1ICSRCDqhg%2FHV8buAmqfjTXKFAQtvqJtGzMY5HPsc8%2FCXXJCbsfjX1YaPCEbt%2BQf6Boi3FoKmgFhH1iCDuziRn7cTgwcvsdjLYQI8XRXOpRrVbsNrySOqHJUwOEkXwOySdEPUmH4FUEhMvTxzzzjv5Vz8paNNdQN67PnSYifAePEgu2hA9YgWtiwGPr0pEKe%2FomM0BG9lMOrs72xb%2F%2FxuaYyNfY7E1%2FaWYzYZ3AMrUWbFpK9Ex1WaDuyaEmCr887imPaxGLg%3D%3D';
  const swid = '{F9A0366F-B19B-4481-AA52-06D9FC8634CA}';

  if (!season || !week) {
    logger.error('Invalid argument: season and week are required.');
    throw new HttpsError(
      'invalid-argument',
      'The "season" and "week" fields are required.'
    );
  }

  try {
    const host = 'https://lm-api-reads.fantasy.espn.com';
    const path = `/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}/players?scoringPeriodId=${week}&view=kona_player_info`;
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

    const data = (await resp.json()) as EspnPlayerData[];
    const simplifiedData = simplifyEspnReturnData(data, week);

    const quarterbacks = simplifiedData
      .filter((p) => p.position === 'QB')
      .slice(0, 30);
    const runningBacks = simplifiedData
      .filter((p) => p.position === 'RB')
      .slice(0, 30);
    const wideReceivers = simplifiedData
      .filter((p) => p.position === 'WR')
      .slice(0, 65);
    const tightEnds = simplifiedData
      .filter((p) => p.position === 'TE')
      .slice(0, 30);
    const dsts = simplifiedData
      .filter((p) => p.position === 'DST')
      .slice(0, 25);

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
