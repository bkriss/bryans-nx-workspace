import { Player } from './player.model';

export interface Lineup {
  lineupGroup: string; // equivalent to QB ID
  lineupIndex: number; // lineup index for given group
  qb: Player;
  rb1: Player | null;
  rb2: Player | null;
  wr1: Player | null;
  wr2: Player | null;
  wr3: Player | null;
  te: Player | null;
  flex: Player | null;
  dst: Player | null;
  remainingSalary: number;
}
