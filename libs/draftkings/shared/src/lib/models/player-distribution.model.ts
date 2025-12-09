import { Position } from '../enums';

export interface PlayerDistribution {
  count: number;
  name: string;
  opposingTeamAbbrev: string;
  overLimit: boolean;
  percentageDifference: string;
  percentageOfLineups: number;
  playerId: string;
  teamAbbrev: string;
  underMinimumRequirement: boolean;
}

interface PlayerWithNotableOverlap {
  name: string;
  playerId: string;
  numberOfLineupsWithThisPlayer: number;
  percentageOfLineupsWithThisPlayer: number;
}

export interface PlayerOverlapReview {
  name: string;
  playerId: string;
  position: Position;
  rbsInLineupsWithThisPlayer: PlayerWithNotableOverlap[];
  wrsInLineupsWithThisPlayer: PlayerWithNotableOverlap[];
  tesInLineupsWithThisPlayer: PlayerWithNotableOverlap[];
  dstsInLineupsWithThisPlayer: PlayerWithNotableOverlap[];
}
