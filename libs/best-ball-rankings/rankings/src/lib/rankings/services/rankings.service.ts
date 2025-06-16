import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Player } from '../models';
import { players } from '../utils';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Result<T> {
  data: T;
  error?: string;
  // message?: string;
  // status?: string;
  // statusCode?: number;
  // totalCount?: number;
  // totalPages?: number;
  // pageSize?: number;
  // pageNumber?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RankingsService {
  constructor() {
    effect(() => {
      this.playerRankings.set(this.playersResult().data);
      console.log('playersResults: ', this.playersResult());
    });
  }
  private http = inject(HttpClient);
  private playersResults$ = new Observable<Result<Player[]>>();
  // Storing Observable of players
  // private playersResults$ = this.http.get<Player[]>('example/api/players').pipe(
  //   map((players) => ({ data: players } as Result<Player[]>)),
  //   tap((players) => console.log('Fetched players:', players.data)),
  //   shareReplay(1),
  //   catchError((error) =>
  //     of({
  //       data: [],
  //       error: `Failed to fetch players: ${error}`,
  //       // error: 'Failed to fetch players',
  //     } as Result<Player[]>)
  //   )
  // );

  // Converting Observable to Signal
  playersResult = toSignal(this.playersResults$, {
    initialValue: { data: [] } as Result<Player[]>,
  });
  // playerRankings = computed(() => this.playersResult().data);
  playersError = computed(() => this.playersResult().error);

  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  playerRankings = signal<Player[]>([]);

  // constructor() {

  //  }

  getPlayerRankings(): void {
    console.log('Fetching player rankings 1...');
    // TODO: Fetch player rankings from an API or a database
    this.isLoading.set(true);
    setTimeout(() => {
      this.playerRankings.set([...players]);
      this.isLoading.set(false);
    }, 1500);

    // private playersResults$ = this.http.get<Player[]>('example/api/players').pipe(
    //   map((players) => ({ data: players } as Result<Player[]>)),
    //   tap((players) => console.log('Fetched players:', players.data)),
    //   shareReplay(1),
    //   catchError((error) =>
    //     of({
    //       data: [],
    //       error: `Failed to fetch players: ${error}`,
    //       // error: 'Failed to fetch players',
    //     } as Result<Player[]>)
    //   )
    // );

    // TODO: Fetch player rankings from an API or a database
    // return new Observable<void>((observer) => {
    //   console.log('Fetching player rankings 2...');
    //   this.isLoading.set(true);
    //   // Simulate an API call to add a player
    //   setTimeout(() => {
    //     this.playerRankings.set([...players]);
    //     this.isLoading.set(false);
    //     observer.next();
    //     observer.complete();
    //   }, 2000);
    // });
  }

  addPlayer(player: Player): void {
    this.isSaving.set(true);
    // Simulate an API call to add a player
    setTimeout(() => {
      const currentRankings = this.playerRankings();
      this.playerRankings.set([...currentRankings, player]);
      this.isSaving.set(false);
    }, 1500);

    // return new Observable<void>((observer) => {
    //   this.isLoading.set(true);
    //   // Simulate an API call to add a player
    //   setTimeout(() => {
    //     const currentRankings = this.playerRankings();
    //     this.playerRankings.set([...currentRankings, player]);
    //     this.isLoading.set(false);
    //     observer.next();
    //     observer.complete();
    //   }, 1500);
    // });
  }
}
