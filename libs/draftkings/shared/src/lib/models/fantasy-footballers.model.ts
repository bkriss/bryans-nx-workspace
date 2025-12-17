export interface FantasyFootballersProjections {
  quarterbacks: MappedFantasyFootballersPlayer[];
  runningBacks: MappedFantasyFootballersPlayer[];
  wideReceivers: MappedFantasyFootballersPlayer[];
  tightEnds: MappedFantasyFootballersPlayer[];
  defenses: MappedFantasyFootballersPlayer[];
}

export interface RawFantasyFootballersPlayer {
  '"Name"': string;
  '"PTS"': string;
  '"Team"': string;
}

export interface MappedFantasyFootballersPlayer {
  id: string;
  name: string;
  projectedPoints: number;
  teamAbbrev: string;
}
