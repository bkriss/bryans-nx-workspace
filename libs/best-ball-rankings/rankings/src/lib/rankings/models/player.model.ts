import { Position } from '../enums';

export interface Player {
  draftKingsPlayerId: number;
  name: string;
  position: Position;
  rank: number;
  reasonsForConcern: string;
  reasonsForOptimism: string;
  teamAbbreviation: string;
  teamId: number;
  teamLongName: string;
}
