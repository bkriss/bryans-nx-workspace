import {
  Flex,
  Player,
  Quarterback,
  RunningBack,
  TightEnd,
  WideReceiver,
} from './player.model';

export interface Lineup {
  contestDetails?: DraftKingsContestDetails;
  // lineupGroup: string; // equivalent to QB ID
  // lineupIndex: number; // lineup index for given group
  lineupGrade: number;
  lineupId: string; // unique identifier for given lineup
  qb: Quarterback | null;
  rb1: RunningBack | null;
  rb2: RunningBack | null;
  wr1: WideReceiver | null;
  wr2: WideReceiver | null;
  wr3: WideReceiver | null;
  te: TightEnd | null;
  flex: Flex | null;
  dst: Player | null;
  remainingSalary: number;
}

export interface DraftKingsContestDetails {
  entryId: string;
  contestName: string;
  contestId: string;
  entryFee: string;
}
