import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PassCatcher, Player, Quarterback, RunningBack } from '../models';
import { Slate } from '../enums';

/**
 * Get available players from slate-store
 * Fetch player projections with projections service
 * Merge projections into available players
 *
 */

export interface PlayerPoolSelections {
  // id?: string;
  quarterbacks: Quarterback[];
  runningBacks: RunningBack[];
  wideReceivers: PassCatcher[];
  tightEnds: PassCatcher[];
  defenses: Player[];
}

@Injectable({
  providedIn: 'root',
})
export class PlayerSelectionService {
  private firestore: Firestore = inject(Firestore);

  /**
   * Fetch selectedPlayers for the provided slate from the 'selectedPlayers' collection.
   * Each document is keyed by slate (e.g., MAIN, EARLY_ONLY, etc.).
   */
  getPlayerPoolSelections(
    slate: Slate
  ): Observable<PlayerPoolSelections | null> {
    const docRef = doc(this.firestore, 'selectedPlayers', slate);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data() as PlayerPoolSelections;
        }
        return null;
      })
    );
  }

  /**
   * Save selected players for the provided slate into the 'selectedPlayers' collection.
   * The document ID is the slate (e.g., MAIN).
   */
  saveSelectedPlayers(
    slate: Slate,
    players: Partial<PlayerPoolSelections>
  ): Observable<void> {
    const docRef = doc(this.firestore, 'selectedPlayers', slate);

    return from(setDoc(docRef, players, { merge: true }));
  }
}
