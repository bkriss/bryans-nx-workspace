import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Lineup, Player } from '@bryans-nx-workspace/draftkings-shared';

@Component({
  selector: 'dfs-lineup-builder-position',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './lineup-builder-position.component.html',
  styleUrl: './lineup-builder-position.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuilderPositionComponent {
  @Input() availablePlayers: Player[] = [];
  @Input() player: Player | null = null;
  @Input() className!: string; // TODO: Convert to enum?
  @Input() lineup!: Lineup;
  @Input() position!: string; // TODO: Convert to enum
  @Output() selectPlayer = new EventEmitter<Player>();
  @Output() removePlayer = new EventEmitter<Player>();
}
