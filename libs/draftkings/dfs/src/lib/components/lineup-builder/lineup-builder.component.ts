import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lineup, Player } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { LineupBuilderPositionComponent } from '../lineup-builder-position/lineup-builder-position.component';

@Component({
  selector: 'dfs-lineup-builder',
  imports: [
    CommonModule,
    LineupBuilderPositionComponent,
    // TODO: Remove Material imports
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './lineup-builder.component.html',
  styleUrl: './lineup-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuilderComponent {
  @Input() lineup!: Lineup;

  removePlayer(player: Player): void {
    console.log('Remove Player clicked', player);
  }

  removeQb(): void {
    console.log('Remove QB clicked');
  }

  selectQb(): void {
    console.log('Select QB clicked');
  }

  selectRb(): void {
    console.log('Select RB clicked');
  }

  selectPlayer(position: string): void {
    console.log(`Select Player clicked for position: ${position}`);
  }
}
