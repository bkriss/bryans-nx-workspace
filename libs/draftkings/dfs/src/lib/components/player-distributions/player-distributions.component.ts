import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerDistribution, Quarterback } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'dfs-player-distributions',
  imports: [CommonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './player-distributions.component.html',
  styleUrl: './player-distributions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerDistributionsComponent {
  @Input() currentQb!: Quarterback;
  @Input() runningBackDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() quarterbackDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() wideReceiverDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() tightEndDistribution: Signal<PlayerDistribution[]> = signal([]);
  @Input() dstDistribution: Signal<PlayerDistribution[]> = signal([]);

  // filteredRunningBackDistribution = computed(() =>
  //   this.runningBackDistribution().filter(
  //     (player) => player.count > 0 || player.underMinimumRequirement
  //   )
  // );
}
