import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule, NgFor } from '@angular/common';
// import { NxWelcomeComponent } from './nx-welcome.component';
import { MatCardModule } from '@angular/material/card';

import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface Player {
  name: string;
  overallRank: number;
  playerId: string;
  position: Position;
  positionRank: number;
  reasonsForConcern: string;
  reasonsForOptimism: string;
  teamAbbreviation: string;
  teamId: string;
  teamLongName: string;
}

export interface Team {
  teamId: string;
  teamAbbreviation: string;
  teamLongName: string;
}

enum Position {
  QB = 'QB',
  RB = 'RB',
  TE = 'TE',
  WR = 'WR',
}

@Component({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule,
    NgFor,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dynasty-rookie-rankings';
  position = Position;
  players = signal<Player[]>([
    {
      name: 'Jamar Chase',
      overallRank: 1,
      playerId: 'fsdfsdf',
      position: Position.WR,
      positionRank: 1,
      reasonsForConcern: '',
      reasonsForOptimism: '',
      teamAbbreviation: 'CIN',
      teamId: 'fddfdf',
      teamLongName: 'Cincinnati Bengals',
    },
    {
      name: 'Justin Jefferson',
      overallRank: 5,
      playerId: 'abdfsdf',
      position: Position.WR,
      positionRank: 2,
      reasonsForConcern: 'New/unproven QB.',
      reasonsForOptimism: '- -',
      teamAbbreviation: 'MIN',
      teamId: 'fsdfsdf',
      teamLongName: 'Minnesota Vikings',
    },
  ]);

  profileForm = new FormGroup({
    name: new FormControl(''),
    position: new FormControl(),
    reasonsForConcern: new FormControl(),
    reasonsForOptimism: new FormControl(),
    teamId: new FormControl(),
  });

  teams: Team[] = [
    {
      teamAbbreviation: 'ARI',
      teamId: 'afsdff',
      teamLongName: 'Arizona Cardinals',
    },
    {
      teamAbbreviation: 'ATL',
      teamId: 'asdf',
      teamLongName: 'Atlanta Falcons',
    },
  ];

  savePlayer(isEditing = false) {
    const selectedTeam: Team | undefined = this.teams.find(
      (team) => team.teamId === this.profileForm.value.teamId
    );

    if (!selectedTeam) return;

    const newPlayer: Player = {
      name: this.profileForm.value.name || '',
      overallRank: 0,
      playerId: Date.now().toString(),
      position: this.profileForm.value.position || Position.QB,
      positionRank: this.players().length + 1,
      reasonsForConcern: this.profileForm.value.reasonsForConcern,
      reasonsForOptimism: this.profileForm.value.reasonsForOptimism,
      teamAbbreviation: selectedTeam.teamAbbreviation,
      teamId: selectedTeam.teamId,
      teamLongName: selectedTeam.teamLongName,
    };
    console.log('save', newPlayer);

    this.players.update((player) => [...player, newPlayer]);

    this.profileForm.reset();
  }
}
