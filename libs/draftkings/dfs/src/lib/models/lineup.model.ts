import {
  Flex,
  Player,
  Quarterback,
  RunningBack,
  SimplePlayer,
  TightEnd,
  WideReceiver,
} from './player.model';

export interface Lineup {
  contestDetails?: DraftKingsContestDetails;
  lineupGrade: number;
  lineupId: string;
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

export interface SimpleLineup {
  contestDetails?: DraftKingsContestDetails;
  lineupGrade: number;
  lineupId: string;
  qb: SimplePlayer | null;
  rb1: SimplePlayer | null;
  rb2: SimplePlayer | null;
  wr1: SimplePlayer | null;
  wr2: SimplePlayer | null;
  wr3: SimplePlayer | null;
  te: SimplePlayer | null;
  flex: SimplePlayer | null;
  dst: SimplePlayer | null;
  remainingSalary?: number;
}

export interface DraftKingsContestDetails {
  entryId: string;
  contestName: string;
  contestId: string;
  entryFee: string;
}
