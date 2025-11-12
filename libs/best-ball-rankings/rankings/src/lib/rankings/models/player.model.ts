import { Position } from '../enums';

export interface Player {
  draftKingsPlayerId: number;
  id?: number; // Optional for new players
  name: string;
  position: Position;
  rank: number;
  reasonsForConcern: string;
  reasonsForOptimism: string;
  teamAbbreviation: string;
  teamId: number;
  teamLongName: string;
}
