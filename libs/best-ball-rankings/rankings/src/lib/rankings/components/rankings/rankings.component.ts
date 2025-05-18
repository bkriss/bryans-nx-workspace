import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ListComponent } from '@bryans-nx-workspace/bbr/shared';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFootball } from '@fortawesome/free-solid-svg-icons';
import { DxButtonModule } from 'devextreme-angular';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { SavePlayerModalComponent } from '../save-player-modal/save-player-modal.component';
import { Player } from '../../models';
import { players, teams } from '../../utils';

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
export class RankingsComponent {
  faFootball = faFootball;
  isPopupVisible = false;
  players = signal<Player[]>([...players]);
  selectedPlayers = signal<Player[]>([]);
  teams = teams;

  onSelectionChanged(selectedPlayer: Player) {
    this.selectedPlayers.update((player) => [...player, selectedPlayer]);
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

  updatePlayersList(newPlayer: Player) {
    this.players.update((player) => [...player, newPlayer]);
  }

  closePlayerModal() {
    this.isPopupVisible = false;
  }

  reorderPlayers(reorderedPlayers: Player[]) {
    this.players.update(() => [...reorderedPlayers]);
    // TODO: Save the reordered players to the backend or local storage
  }
}
