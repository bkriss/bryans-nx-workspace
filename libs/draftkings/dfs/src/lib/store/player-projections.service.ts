import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable } from 'rxjs';

export interface PlayerScoringProjection {
  firstName: string;
  fullName: string;
  id: number;
  lastName: string;
  position: string;
  projectedPoints: number;
  teamAbbrev: string;
}

export interface PlayerProjections {
  // id?: string;
  quarterbacks: PlayerScoringProjection[];
  runningBacks: PlayerScoringProjection[];
  wideReceivers: PlayerScoringProjection[];
  tightEnds: PlayerScoringProjection[];
  dsts: PlayerScoringProjection[];
}

@Injectable({
  providedIn: 'root',
})
export class PlayerProjectionsService {
  private functions = inject(Functions);

  /**
   * Calls the 'playerScoringProjections' Cloud Function using AngularFire.
   *
   * @returns An Observable that emits the function's result or an error.
   */
  getPlayerScoringProjections(): Observable<PlayerProjections> {
    const callFunction = httpsCallableData(
      this.functions,
      'playerScoringProjections'
    );

    const query = {
      season: 2025,
      week: 12,
    };

    return callFunction({ query }) as Observable<PlayerProjections>;
  }
}
