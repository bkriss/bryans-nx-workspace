import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PassCatcher, Player, Quarterback, RunningBack } from '../models';
import { Slate } from '../enums';

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

  /**
   * Gets the collection name for the given slate
   * @param slate - The current slate
   * @returns The Firestore collection name
   */
  private getCollectionNameForSlate(slate: Slate): string {
    const collectionMap: Record<Slate, string> = {
      [Slate.MAIN]: 'selectedPlayerPoolForMainSlate',
      [Slate.EARLY_ONLY]: 'selectedPlayerPoolForEarlySlate',
      [Slate.SUN_TO_MON]: 'selectedPlayerPoolForSunToMonSlate',
      [Slate.THUR_TO_MON]: 'selectedPlayerPoolForThurToMonSlate',
    };
    return collectionMap[slate];
  }

  /**
   * Saves player pools to the appropriate Firestore collection based on the current slate
   * @param slate - The current slate
   * @param playerPools - The player pools to save
   * @returns Observable of the save operation
   */
  savePlayerPools(slate: Slate, playerPools: PlayerPools): Observable<void> {
    const collectionName = this.getCollectionNameForSlate(slate);
    const docRef = doc(this.firestore, collectionName, 'currentPool');
    
    return from(setDoc(docRef, playerPools, { merge: true }));
  }

  /**
   * Fetches player pools from the appropriate Firestore collection based on the current slate
   * @param slate - The current slate
   * @returns Observable of the player pools, or null if the document doesn't exist
   */
  getPlayerPools(slate: Slate): Observable<PlayerPools | null> {
    const collectionName = this.getCollectionNameForSlate(slate);
    const docRef = doc(this.firestore, collectionName, 'currentPool');
    
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data() as PlayerPools;
        }
        return null;
      })
    );
  }
}
