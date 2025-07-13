import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'best-ball-best-ball',
  imports: [CommonModule],
  templateUrl: './best-ball.component.html',
  styleUrl: './best-ball.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestBallComponent {}
