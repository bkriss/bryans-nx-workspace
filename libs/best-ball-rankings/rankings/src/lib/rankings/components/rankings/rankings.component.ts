import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { ListComponent } from '@bryans-nx-workspace/bbr/shared';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFootball } from '@fortawesome/free-solid-svg-icons';
import { DxButtonModule } from 'devextreme-angular';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { SavePlayerModalComponent } from '../save-player-modal/save-player-modal.component';
import { Player } from '../../models';
import { players, teams } from '../../utils';
import { RankingsService } from '../../services';
import { catchError, map, of, shareReplay, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'lib-rankings',
  imports: [
    DxButtonModule,
    FontAwesomeModule,
    ListComponent,
    NgFor,
    NgIf,
    PlayerCardComponent,
    SavePlayerModalComponent,
  ],
  standalone: true,
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingsComponent implements OnInit {
  private rankingsService = inject(RankingsService);

  faFootball = faFootball;
  isLoading = this.rankingsService.isLoading;
  isPopupVisible = false;
  // toSignal is readonly and automatically subscribes and unsubscribes to the observable
  // players = toSignal<Player[]>(this.players$, {
  //   initialValue: [] as Player[],
  // });
  players = this.rankingsService.playerRankings;
  selectedPlayers = signal<Player[]>([]);
  teams = teams;
  test1 = signal<number>(1);
  test2 = signal<number>(2);
  // This is a computed property that will automatically update when test1 or test2 changes
  example = computed(() => this.test1() + this.test2());

  constructor() {
    effect(() => console.log('players:: ', this.players()));
    effect(() => console.log('example:: ', this.example()));
    effect(() =>
      console.log(
        'Players selected: ',
        this.selectedPlayers()
          .map((p) => p.name)
          .join(', ')
      )
    );
  }

  ngOnInit(): void {
    this.rankingsService.getPlayerRankings();
  }

  onSelectionChanged(selectedPlayer: Player) {
    const numberOfSelectedPlayers = this.selectedPlayers().length;
    if (numberOfSelectedPlayers >= 2) {
      // replace 2nd player with new selection
      const selectedPlayers = [this.selectedPlayers()[0], selectedPlayer];
      this.selectedPlayers.set(selectedPlayers);
    } else {
      this.selectedPlayers.update((player) => [...player, selectedPlayer]);
    }
  }

  closeSelectedCard(selectedPlayer: Player) {
    this.selectedPlayers.update((player) =>
      player.filter(
        (p) => p.draftKingsPlayerId !== selectedPlayer.draftKingsPlayerId
      )
    );
  }

  openAddPlayerModal() {
    this.isPopupVisible = true;
  }

  // updatePlayersList(newPlayer: Player) {
  //   this.players.update((player) => [...player, newPlayer]);
  // }

  closePlayerModal() {
    this.isPopupVisible = false;
  }

  reorderPlayers(reorderedPlayers: Player[]) {
    this.players.update(() => [...reorderedPlayers]);
    // TODO: Save the reordered players to the backend or local storage
  }
}
