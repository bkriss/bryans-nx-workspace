import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { Position } from '../../enums';
import { Player, Team } from '../../models';
import { RankingsService } from '../../services';

@Component({
  selector: 'lib-save-player-modal',
  imports: [
    CommonModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxPopupModule,
    DxTextAreaModule,
    DxTextBoxModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './save-player-modal.component.html',
  styleUrl: './save-player-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavePlayerModalComponent {
  @Input() currentNumberOfPlayers = 0;
  @Input() isPopupVisible = false;
  @Input() teams: Team[] = [];
  @Output() closePlayerModal = new EventEmitter();
  // @Output() updatePlayersList = new EventEmitter<Player>();
  private rankingsService = inject(RankingsService);

  playerForm = new FormGroup({
    name: new FormControl<string>(''),
    position: new FormControl<Position | null>(null),
    reasonsForConcern: new FormControl<string>(''),
    reasonsForOptimism: new FormControl<string>(''),
    teamId: new FormControl<number | null>(null),
  });
  positions = [
    { id: Position.QB, name: Position.QB },
    { id: Position.RB, name: Position.RB },
    { id: Position.TE, name: Position.TE },
    { id: Position.WR, name: Position.WR },
  ];

  savePlayer(isEditing = false, closeAfterSave = true) {
    console.log('isEditing: ', isEditing);
    const selectedTeam: Team | undefined = this.teams.find(
      (team) => team.teamId === this.playerForm.value.teamId
    );

    if (!selectedTeam) return;

    const newPlayer: Player = {
      draftKingsPlayerId: Date.now(),
      name: this.playerForm.value.name || '',
      position: this.playerForm.value.position || Position.QB,
      rank: this.currentNumberOfPlayers + 1,
      reasonsForConcern: this.playerForm.value.reasonsForConcern || '',
      reasonsForOptimism: this.playerForm.value.reasonsForOptimism || '',
      teamAbbreviation: selectedTeam.teamAbbreviation,
      teamId: selectedTeam.teamId,
      teamLongName: selectedTeam.teamLongName,
    };

    // TODO: Save player to the backend or local storage

    // this.updatePlayersList.emit(newPlayer);

    this.rankingsService.addPlayer(newPlayer);

    this.playerForm.reset();

    // TODO: Subscribe to Observable and move this code inside the subscription
    if (closeAfterSave) {
      this.closePlayerModal.emit();
    }
  }

  cancel() {
    this.playerForm.reset();
    this.closePlayerModal.emit();
  }
}
