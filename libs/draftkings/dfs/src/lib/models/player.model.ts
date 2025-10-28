export interface Player {
  gameInfo: string;
  gradeOutOfTen: number;
  id: string;
  isSelectedForPlayerPool: boolean;
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
  useAsAlternate: boolean;
}

export interface PassCatcherStack {
  passCatchers: PassCatcher[];
  randomizedGrade: number;
  // avgGradeOutOfTen: number;
  totalCostOfThisPassCatcherCombo: number;
}

// TODO: If WideReceiver and TightEnd remain identical, replace each reference to those models with PassCatcher
export interface WideReceiver extends Player {
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

export interface TightEnd extends Player {
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

// WR or TE
export interface PassCatcher extends Player {
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb: boolean;
}

export interface Flex extends Player {
  allowRBFromOpposingTeam?: boolean;
  maxOwnershipWhenPairedWithQb?: number;
  minOwnershipWhenPairedWithQb?: number;
  maxOwnershipWhenPairedWithOpposingQb?: number;
  minOwnershipWhenPairedWithOpposingQb?: number;
  onlyUseIfPartOfStackOrPlayingWithOrAgainstQb?: boolean;
}
