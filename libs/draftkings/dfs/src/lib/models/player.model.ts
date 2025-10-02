export interface Player {
  gameInfo: string;
  id: string;
  name: string;
  nameAbbrev: string;
  position: string;
  salary: number;
  teamAbbrev: string;
  opposingTeam: string;
}

export interface Quarterback extends Player {
  maxNumberOfTeammatePasscatchers: number;
  minNumberOfTeammatePasscatchers: number;
  numberOfLineupsWithThisPlayer: number;
  requirePassCatcherFromOpposingTeam: boolean;
  qbPassCatcherPairings: Player[][];
}

export interface WideReceiver extends Player {
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

export interface TightEnd extends Player {
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}
