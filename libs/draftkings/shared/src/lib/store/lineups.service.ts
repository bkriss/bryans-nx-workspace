import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SimpleLineup } from '../models';
import { Slate } from '../enums';

export interface Lineups {
  id?: string;
  lineupsForQb1: SimpleLineup[];
  lineupsForQb2: SimpleLineup[];
  lineupsForQb3: SimpleLineup[];
  lineupsForQb4: SimpleLineup[];
  lineupsForQb5: SimpleLineup[];
}

@Injectable({
  providedIn: 'root',
})
export class LineupsService {
  private firestore: Firestore = inject(Firestore);

  /**
   * Fetch lineups for the provided slate from the 'lineups' collection.
   * Each document is keyed by slate (e.g., MAIN, EARLY_ONLY, etc.).
   */
  getLineups(slate: Slate): Observable<Lineups | null> {
    const docRef = doc(this.firestore, 'lineups', slate);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data() as Lineups;
        }
        return null;
      })
    );
  }

  /**
   * Save lineups for the provided slate into the 'lineups' collection.
   * The document ID is the slate (e.g., MAIN).
   */
  saveLineups(slate: Slate, lineups: Partial<Lineups>): Observable<void> {
    const docRef = doc(this.firestore, 'lineups', slate);
    return from(setDoc(docRef, lineups, { merge: true }));
  }
}
