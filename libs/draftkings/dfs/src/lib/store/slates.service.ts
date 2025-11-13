// TODO: Change filename to be specific to one store
import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Slate } from '../enums';

export interface SlateData {
  id?: string;
  currentSlate: Slate;
  entries: Record<Slate, string>;
  salaries: Record<Slate, string>;
}

@Injectable({
  providedIn: 'root',
})
export class SlatesService {
  private firestore: Firestore = inject(Firestore);

  getSlateData(): Observable<SlateData[]> {
    const slatesCollection = collection(this.firestore, 'slateData');
    return collectionData(query(slatesCollection), {
      idField: 'id',
    }) as Observable<SlateData[]>;
  }

  updateSlate(id: string, updates: Partial<SlateData>): Observable<void> {
    const slateDocRef = doc(this.firestore, 'slateData', id);
    return from(updateDoc(slateDocRef, updates));
  }
}
