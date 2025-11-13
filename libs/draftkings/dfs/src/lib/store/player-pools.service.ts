import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { PassCatcher, Player, Quarterback, RunningBack } from '../models';

export interface PlayerPools {
  id?: string;
  quarterbacks: Quarterback[];
  runningBacks: RunningBack[];
  wideReceivers: PassCatcher[];
  tightEnds: PassCatcher[];
  defenses: Player[];
}

@Injectable({
  providedIn: 'root',
})
export class PlayerPoolsService {
  private firestore: Firestore = inject(Firestore);

  // TODO: Implement methods to get and update selectedPlayerPoolForMainSlate, selectedPlayerPoolForEarlySlate, selectedPlayerPoolForSunToMonSlate, and selectedPlayerPoolForThurToMonSlate depending on the current slate.
}
