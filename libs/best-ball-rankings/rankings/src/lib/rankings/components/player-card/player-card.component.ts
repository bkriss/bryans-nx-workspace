import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { DxButtonModule } from 'devextreme-angular';
import { Player } from '../../models';

@Component({
  selector: 'lib-player-card',
  imports: [DxButtonModule, FaIconComponent],
  standalone: true,
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  @Input() player: Player | undefined;
  @Output() closeCard = new EventEmitter<Player>();

  faThumbsDown = faThumbsDown;
  faThumbsUp = faThumbsUp;
}
