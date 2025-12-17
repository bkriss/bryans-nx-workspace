import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { DfsPlatform } from '../enums';
import { FantasyFootballersProjections } from '../models';

export interface PlayerScoringProjection {
  firstName: string;
  fullName: string;
  id: number;
  lastName: string;
  position: string;
  projectedPointsAvg: number;
  projectedPointsEspn: number;
  projectedPointsFantasyFootballers: number;
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
  private firestore: Firestore = inject(Firestore);
  private functions = inject(Functions);

  nflWeeks = [
    {
      week: 1,
      startDate: this.setDate(9, 3, 2025, 'start'),
      endDate: this.setDate(9, 8, 2025, 'end'),
    },
    {
      week: 2,
      startDate: this.setDate(9, 9, 2025, 'start'),
      endDate: this.setDate(9, 15, 2025, 'end'),
    },
    {
      week: 3,
      startDate: this.setDate(9, 16, 2025, 'start'),
      endDate: this.setDate(9, 22, 2025, 'end'),
    },
    {
      week: 4,
      startDate: this.setDate(9, 23, 2025, 'start'),
      endDate: this.setDate(9, 29, 2025, 'end'),
    },
    {
      week: 5,
      startDate: this.setDate(9, 30, 2025, 'start'),
      endDate: this.setDate(10, 6, 2025, 'end'),
    },
    {
      week: 6,
      startDate: this.setDate(10, 7, 2025, 'start'),
      endDate: this.setDate(10, 13, 2025, 'end'),
    },
    {
      week: 7,
      startDate: this.setDate(10, 14, 2025, 'start'),
      endDate: this.setDate(10, 20, 2025, 'end'),
    },
    {
      week: 8,
      startDate: this.setDate(10, 21, 2025, 'start'),
      endDate: this.setDate(10, 27, 2025, 'end'),
    },
    {
      week: 9,
      startDate: this.setDate(10, 28, 2025, 'start'),
      endDate: this.setDate(11, 3, 2025, 'end'),
    },
    {
      week: 10,
      startDate: this.setDate(11, 4, 2025, 'start'),
      endDate: this.setDate(11, 10, 2025, 'end'),
    },
    {
      week: 11,
      startDate: this.setDate(11, 11, 2025, 'start'),
      endDate: this.setDate(11, 17, 2025, 'end'),
    },
    {
      week: 12,
      startDate: this.setDate(11, 18, 2025, 'start'),
      endDate: this.setDate(11, 24, 2025, 'end'),
    },
    {
      week: 13,
      startDate: this.setDate(11, 25, 2025, 'start'),
      endDate: this.setDate(12, 1, 2025, 'end'),
    },
    {
      week: 14,
      startDate: this.setDate(12, 2, 2025, 'start'),
      endDate: this.setDate(12, 8, 2025, 'end'),
    },
    {
      week: 15,
      startDate: this.setDate(12, 9, 2025, 'start'),
      endDate: this.setDate(12, 15, 2025, 'end'),
    },
    {
      week: 16,
      startDate: this.setDate(12, 16, 2025, 'start'),
      endDate: this.setDate(12, 22, 2025, 'end'),
    },
    {
      week: 17,
      startDate: this.setDate(12, 23, 2025, 'start'),
      endDate: this.setDate(12, 29, 2025, 'end'),
    },
    {
      week: 18,
      startDate: this.setDate(12, 30, 2025, 'start'),
      endDate: this.setDate(1, 5, 2026, 'end'),
    },
  ];

  getPlayerScoringProjections(): Observable<PlayerProjections> {
    const callFunction = httpsCallableData(
      this.functions,
      'playerScoringProjections'
    );

    const now = new Date().getTime();
    const currentNflWeek = this.nflWeeks.find((week) => {
      return now >= week.startDate && now <= week.endDate;
    });

    const date = new Date();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();

    const query = {
      season: month >= 9 ? year : year - 1,
      week: currentNflWeek ? currentNflWeek.week : 0,
      numberOfTeams: 28, // TODO: Get this dynamically based on the slate
    };

    return callFunction({ query }) as Observable<PlayerProjections>;
  }

  saveFantasyFootballersProjections(
    dfsPlatform: DfsPlatform,
    fantasyFootballersProjections: Partial<FantasyFootballersProjections>
  ): Observable<void> {
    const docRef = doc(this.firestore, 'projections', dfsPlatform);

    return from(setDoc(docRef, fantasyFootballersProjections, { merge: true }));
  }

  setDate(
    month: number,
    day: number,
    year: number,
    timeOfDay: 'start' | 'end'
  ): number {
    const simpleDateString = `${year}-${String(month).padStart(
      2,
      '0'
    )}-${String(day).padStart(2, '0')}`;
    const timeOfDayString =
      timeOfDay === 'start' ? 'T06:00:00.000Z' : 'T05:59:59.999Z';
    return new Date(`${simpleDateString}${timeOfDayString}`).getTime();
  }
}
