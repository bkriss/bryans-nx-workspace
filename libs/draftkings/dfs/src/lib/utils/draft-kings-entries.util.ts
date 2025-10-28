import { DraftKingsEntry, TableFriendlyDraftKingsEntry } from '../models';
import { csvToJson } from './csv-to-json.util';
import { entries } from './entries';

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
    name: 'NFL $10K Huddle [Single Entry]',
    entries: 2378,
    prize: 1000,
  },
  {
    name: 'NFL $30K 4th and 10 [10 Entry Max]',
    entries: 875,
    prize: 3000,
  },
  {
    name: 'NFL $100K Slant [$10K to 1st 2x Min Cash]',
    entries: 13000,
    prize: 10000,
  },
  {
    name: 'NFL $40K Front Four [20 Entry Max]',
    entries: 11800,
    prize: 4000,
  },
  {
    name: 'NFL $20K Safety [20 Entry Max]',
    entries: 11800,
    prize: 1000,
  },
  {
    name: 'NFL $150K Three-Point Stance [5 Entry Max]',
    entries: 5300,
    prize: 20000,
  },
  {
    name: 'NFL $15K Screen Pass [3 Entry Max]',
    entries: 1176,
    prize: 1500,
  },
  {
    name: 'NFL $60K Screen Pass [3 Entry Max]',
    entries: 4705,
    prize: 6000,
  },
  {
    name: 'NFL $75K Screen Pass [3 Entry Max]',
    entries: 5882,
    prize: 10000,
  },
  {
    name: 'NFL $40K Engage Eight [3 Entry Max]',
    entries: 5882,
    prize: 4000,
  },
  {
    name: 'NFL $40K Nickel [3 Entry Max]',
    entries: 9512,
    prize: 4000,
  },
  {
    name: 'NFL $15K Cover Four [3 Entry Max]',
    entries: 4458,
    prize: 1500,
  },
  {
    name: 'NFL $25K Triple Option [3 Entry Max]',
    entries: 9908,
    prize: 2500,
  },
  {
    name: 'NFL $50K Red Zone [Single Entry]',
    entries: 1136,
    prize: 5000,
  },
  {
    name: 'NFL $100K Red Zone [Single Entry]',
    entries: 2272,
    prize: 10000,
  },
  {
    name: 'NFL $200K Red Zone [$25K to 1st Single Entry]',
    entries: 4545,
    prize: 25000,
  },
  {
    name: 'NFL $25K Blind Side [Single Entry]',
    entries: 1079,
    prize: 2500,
  },
  {
    name: 'NFL $50K Blind Side [Single Entry]',
    entries: 2159,
    prize: 5000,
  },
  {
    name: 'NFL $75K Blind Side [Single Entry]',
    entries: 3229,
    prize: 7500,
  },
  {
    name: 'NFL $40K 1st and 10 [10 Entry Max]',
    entries: 4705,
    prize: 4000,
  },
  {
    name: 'NFL $50K 1st and 10 [10 Entry Max]',
    entries: 5882,
    prize: 5000,
  },
  {
    name: 'NFL $15K Hail Mary [Single Entry]',
    entries: 1470,
    prize: 1500,
  },
  {
    name: 'NFL $25K Fair Catch [Single Entry]',
    entries: 2450,
    prize: 2500,
  },
  {
    name: 'NFL $75K Fair Catch [Single Entry]',
    entries: 7352,
    prize: 7500,
  },
  {
    name: 'NFL $175K Fair Catch [Single Entry]',
    entries: 17100,
    prize: 15000,
  },
  {
    name: 'NFL $10K Pylon [Single Entry]',
    entries: 3963,
    prize: 1000,
  },
  {
    name: 'NFL $40K Pylon [Single Entry]',
    entries: 15800,
    prize: 4000,
  },
];

export const draftKingsEntries = csvToJson(entries)
  .map((rawEntry: RawEntry): TableFriendlyDraftKingsEntry => {
    const contest = contestSizes.find(
      (contest) => contest.name === rawEntry['Contest Name']
    );
    const contestSize = contest?.entries || 0;
    const topPrize = contest?.prize || 0;

    if (!contestSize || !topPrize) {
      console.warn(
        'Could not find contest size or top prize for entry:',
        rawEntry['Contest Name']
      );
    }

    console.log('contest score data', {
      contestName: rawEntry['Contest Name'],
      contestSize,
      topPrize,
      contestScore: contestSize ? topPrize / contestSize : 0,
    });

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
