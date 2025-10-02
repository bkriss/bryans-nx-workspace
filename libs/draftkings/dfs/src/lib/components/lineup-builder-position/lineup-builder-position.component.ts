import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'dfs-lineup-builder-position',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './lineup-builder-position.component.html',
  styleUrl: './lineup-builder-position.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupBuilderPositionComponent {
  @Input() player: Player | null = null;
  @Input() className!: string; // TODO: Convert to enum
  @Input() position!: string; // TODO: Convert to enum
  // @Output() selectPlayer = new EventEmitter<string>(); // TODO: Change to enum
  @Output() selectPlayer = new EventEmitter<string>(); // TODO: Change to enum
  @Output() removePlayer = new EventEmitter<Player>();
  // className = this.position?.slice(0, 1).toLowerCase();
}
