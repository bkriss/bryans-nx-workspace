export interface DraftKingsEntry {
  'Contest ID': string;
  'Contest Name': string;
  'Entry Fee': string;
  'Entry ID': string;
  entryFeeAsNumber?: number;
  QB: string; // ex: "Bo Nix (40469970)"
  RB1: string;
  RB2: string;
  WR1: string;
  WR2: string;
  WR3: string;
  TE: string;
  FLEX: string;
  DST: string;
}

export interface TableFriendlyDraftKingsEntry extends DraftKingsEntry {
  contestSize: number;
  contestScore: number; // topPrize / contestSize
  topPrize: number;
  QB_NAME: string;
  RB1_NAME: string;
  RB2_NAME: string;
  WR1_NAME: string;
  WR2_NAME: string;
  WR3_NAME: string;
  TE_NAME: string;
  FLEX_NAME: string;
  DST_NAME: string;
}
