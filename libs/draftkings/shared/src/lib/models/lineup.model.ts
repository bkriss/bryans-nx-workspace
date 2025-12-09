import {
  Flex,
  PassCatcher,
  Player,
  Quarterback,
  RunningBack,
  SimplePlayer,
} from './player.model';

export interface Lineup {
  contestDetails?: DraftKingsContestDetails;
  lineupGrade: number;
  lineupScore: number; // lineupGrade + totalProjectedPoints
  lineupId: string;
  qb: Quarterback | null;
  rb1: RunningBack | null;
  rb2: RunningBack | null;
  wr1: PassCatcher | null;
  wr2: PassCatcher | null;
  wr3: PassCatcher | null;
  te: PassCatcher | null;
  flex: Flex | null;
  dst: Player | null;
  remainingSalary: number;
  totalProjectedPoints: number;
}

export interface SimpleLineup {
  contestDetails: DraftKingsContestDetails | null;
  lineupGrade: number;
  lineupScore: number; // lineupGrade + totalProjectedPoints
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
  totalProjectedPoints: number;
}

export interface DraftKingsContestDetails {
  entryId: string;
  contestName: string;
  contestId: string;
  entryFee: string;
}
