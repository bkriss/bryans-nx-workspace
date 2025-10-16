export interface Player {
  gameInfo: string;
  id: string;
  maxOwnershipPercentage: number;
  minOwnershipPercentage: number;
  name: string;
  nameAbbrev: string;
  position: string;
  salary: number;
  teamAbbrev: string;
  opposingTeamAbbrev: string;
}

export interface Quarterback extends Player {
  maxNumberOfTeammatePasscatchers: number;
  minNumberOfTeammatePasscatchers: number;
  numberOfLineupsWithThisPlayer: number;
  requirePassCatcherFromOpposingTeam: boolean;
  qbPassCatcherPairings: PassCatcherStack[];
}

export interface RunningBack extends Player {
  allowRBFromOpposingTeam: boolean;
}

export interface PassCatcherStack {
  passCatchers: PassCatcher[];
  randomizedGrade: number;
  // avgGradeOutOfTen: number;
  totalCostOfThisPassCatcherCombo: number;
}

// TODO: If WideReceiver and TightEnd remain identical, replace each reference to those models with PassCatcher
export interface WideReceiver extends Player {
  gradeOutOfTen: number;
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

export interface TightEnd extends Player {
  gradeOutOfTen: number;
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

// WR or TE
export interface PassCatcher extends Player {
  gradeOutOfTen: number;
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}
