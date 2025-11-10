import { TableFriendlyDraftKingsEntry } from '../models';
import { csvToJson } from './csv-to-json.util';
// import { entries } from './early-only/entries';
import { entries } from './main-slate/entries';

interface RawEntry {
  'Contest ID': string;
  'Contest Name': string;
  DST: string;
  'Entry Fee': string;
  'Entry ID': string;
  FLEX: string;
  QB: string;
  RB: string;
  TE: string;
  WR: string;
}

export const contestSizes = [
  {
    name: 'NFL $10K Huddle [Single Entry] (Sun-Mon)',
    entries: 2378,
    topPrize: 1000,
  },
  {
    name: 'NFL $15K Sun-Mon Special [$5K to 1st] (Sun-Mon)',
    entries: 1470,
    topPrize: 5000,
  },
  {
    name: 'NFL $5K Play-Action [20 Entry Max] (Sun-Mon)',
    entries: 1981,
    topPrize: 500,
  },
  {
    name: 'NFL $3K First Down [20 Entry Max] (Sun-Mon)',
    entries: 3567,
    topPrize: 300,
  },
  {
    name: 'NFL $5K Fair Catch [Single Entry] (Sun-Mon)',
    entries: 490,
    topPrize: 500,
  },
  {
    name: 'NFL $25K Fair Catch [Single Entry] (Early Only)',
    entries: 2450,
    topPrize: 2500,
  },
  {
    name: 'NFL $15K Fair Catch [Single Entry] (Early Only)',
    entries: 1470,
    topPrize: 1500,
  },
  {
    name: 'NFL $50K Huddle [Single Entry] (Early Only)',
    entries: 11800,
    topPrize: 5000,
  },
  {
    name: 'NFL $700K Play-Action [20 Entry Max]',
    entries: 277400,
    topPrize: 50000,
  },
  {
    name: 'NFL $100K Fair Catch [Single Entry]',
    entries: 9803,
    topPrize: 10000,
  },
  {
    name: 'NFL $40K Front Four [$10K to 1st]',
    entries: 11800,
    topPrize: 10000,
  },
  {
    name: 'NFL $50K Bootleg [$10K to 1st] (Early Only)',
    entries: 1766,
    topPrize: 10000,
  },
  {
    name: 'NFL $40K Play-Action [20 Entry Max] (Early Only)',
    entries: 15800,
    topPrize: 4000,
  },
  {
    name: 'NFL $3K Safety [20 Entry Max] (Early Only)',
    entries: 1783,
    topPrize: 300,
  },
  {
    name: 'NFL $20K First Down [20 Entry Max] (Early Only)',
    entries: 23700,
    topPrize: 1000,
  },
  {
    name: 'NFL $8K Hard Count [3 Entry Max] (Early Only)',
    entries: 470,
    topPrize: 800,
  },
  {
    name: 'NFL $4K Cover Four [3 Entry Max] (Early Only)',
    entries: 1189,
    topPrize: 400,
  },
  {
    name: 'NFL $30K Fair Catch [Single Entry] (Early Only)',
    entries: 2941,
    topPrize: 3000,
  },
  {
    name: 'NFL $10K Fair Catch [Single Entry] (Early Only)',
    entries: 980,
    topPrize: 1000,
  },
  {
    name: 'NFL $60K Huddle [Single Entry] (Early Only)',
    entries: 14200,
    topPrize: 6000,
  },
  {
    name: 'NFL $10K Pylon [Single Entry] (Early Only)',
    entries: 3963,
    topPrize: 1000,
  },
  {
    name: 'NFL $5K Daily Dollar [Single Entry] (Early Only)',
    entries: 5945,
    topPrize: 500,
  },

  {
    name: 'NFL $15K Daily Dollar [Single Entry]',
    entries: 17800,
    topPrize: 1000,
  },
  {
    name: 'NFL $15K Singleback [3 Entry Max]',
    entries: 17800,
    topPrize: 1000,
  },
  {
    name: 'NFL $10K Huddle [Single Entry]',
    entries: 2378,
    topPrize: 1000,
  },
  {
    name: 'NFL $100K Huddle [Single Entry]',
    entries: 23700,
    topPrize: 15000,
  },
  {
    name: 'NFL $30K 4th and 10 [10 Entry Max]',
    entries: 875,
    topPrize: 3000,
  },
  {
    name: 'NFL $100K Slant [$10K to 1st 2x Min Cash]',
    entries: 13000,
    topPrize: 10000,
  },
  {
    name: 'NFL $40K Front Four [20 Entry Max]',
    entries: 11800,
    topPrize: 4000,
  },
  {
    name: 'NFL $20K Safety [20 Entry Max]',
    entries: 11800,
    topPrize: 1000,
  },
  {
    name: 'NFL $125K Three-Point Stance [5 Entry Max]',
    entries: 4417,
    topPrize: 15000,
  },
  {
    name: 'NFL $150K Three-Point Stance [5 Entry Max]',
    entries: 5300,
    topPrize: 20000,
  },
  {
    name: 'NFL $15K Screen Pass [3 Entry Max]',
    entries: 1176,
    topPrize: 1500,
  },
  {
    name: 'NFL $60K Screen Pass [3 Entry Max]',
    entries: 4705,
    topPrize: 6000,
  },
  {
    name: 'NFL $75K Screen Pass [3 Entry Max]',
    entries: 5882,
    topPrize: 10000,
  },
  {
    name: 'NFL $40K Engage Eight [3 Entry Max]',
    entries: 5882,
    topPrize: 4000,
  },
  {
    name: 'NFL $40K Nickel [3 Entry Max]',
    entries: 9512,
    topPrize: 4000,
  },
  {
    name: 'NFL $15K Cover Four [3 Entry Max]',
    entries: 4458,
    topPrize: 1500,
  },
  {
    name: 'NFL $15K Cover Four [5 Entry Max]',
    entries: 4458,
    topPrize: 1500,
  },
  {
    name: 'NFL $25K Triple Option [3 Entry Max]',
    entries: 9908,
    topPrize: 2500,
  },
  {
    name: 'NFL $50K Red Zone [Single Entry]',
    entries: 1136,
    topPrize: 5000,
  },
  {
    name: 'NFL $100K Red Zone [Single Entry]',
    entries: 2272,
    topPrize: 10000,
  },
  {
    name: 'NFL $200K Red Zone [$25K to 1st Single Entry]',
    entries: 4545,
    topPrize: 25000,
  },
  {
    name: 'NFL $25K Blind Side [Single Entry]',
    entries: 1079,
    topPrize: 2500,
  },
  {
    name: 'NFL $50K Blind Side [Single Entry]',
    entries: 2159,
    topPrize: 5000,
  },
  {
    name: 'NFL $75K Blind Side [Single Entry]',
    entries: 3229,
    topPrize: 7500,
  },
  {
    name: 'NFL $40K 1st and 10 [10 Entry Max]',
    entries: 4705,
    topPrize: 4000,
  },
  {
    name: 'NFL $50K 1st and 10 [10 Entry Max]',
    entries: 5882,
    topPrize: 5000,
  },
  {
    name: 'NFL $15K Hail Mary [Single Entry]',
    entries: 1470,
    topPrize: 1500,
  },
  {
    name: 'NFL $25K Fair Catch [Single Entry]',
    entries: 2450,
    topPrize: 2500,
  },
  {
    name: 'NFL $75K Fair Catch [Single Entry]',
    entries: 7352,
    topPrize: 7500,
  },
  {
    name: 'NFL $175K Fair Catch [Single Entry]',
    entries: 17100,
    topPrize: 15000,
  },
  {
    name: 'NFL $10K Pylon [Single Entry]',
    entries: 3963,
    topPrize: 1000,
  },
  {
    name: 'NFL $40K Pylon [Single Entry]',
    entries: 15800,
    topPrize: 4000,
  },
];

export const draftKingsEntries = csvToJson(entries)
  .map((rawEntry: RawEntry): TableFriendlyDraftKingsEntry => {
    const contest = contestSizes.find(
      (contest) => contest.name === rawEntry['Contest Name']
    );
    const contestSize = contest?.entries || 0;
    const topPrize = contest?.topPrize || 0;

    if (!contestSize || !topPrize) {
      console.warn(
        'Could not find contest size or top prize for entry:',
        rawEntry['Contest Name']
      );
    }

    const entry: TableFriendlyDraftKingsEntry = {
      'Entry ID': rawEntry['Entry ID'],
      'Contest Name': rawEntry['Contest Name'],
      'Contest ID': rawEntry['Contest ID'],
      'Entry Fee': rawEntry['Entry Fee'],
      entryFeeAsNumber: Number(rawEntry['Entry Fee'].replace('$', '')),
      QB: '',
      RB1: '',
      RB2: '',
      WR1: '',
      WR2: '',
      WR3: '',
      TE: '',
      FLEX: '',
      DST: '',
      QB_NAME: '',
      RB1_NAME: '',
      RB2_NAME: '',
      WR1_NAME: '',
      WR2_NAME: '',
      WR3_NAME: '',
      TE_NAME: '',
      FLEX_NAME: '',
      DST_NAME: '',
      contestSize,
      contestScore: contestSize ? (topPrize * 5) / contestSize : 0,
      topPrize,
    };

    return entry;
  })
  .filter((entry) => entry['Entry ID']?.length > 0)
  .sort((a, b) => b.contestScore - a.contestScore);
