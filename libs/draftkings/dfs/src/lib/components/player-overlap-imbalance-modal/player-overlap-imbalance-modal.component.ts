import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  // MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PlayerOverlapReview } from '@bryans-nx-workspace/draftkings-shared';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'dfs-player-overlap-imbalance-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatExpansionModule,
    // MatDialogClose,
  ],
  templateUrl: './player-overlap-imbalance-modal.component.html',
  styleUrl: './player-overlap-imbalance-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerOverlapImbalanceModalComponent {
  readonly dialogRef = inject(
    MatDialogRef<PlayerOverlapImbalanceModalComponent>
  );
  readonly data = inject<{ playerOverlapReview: PlayerOverlapReview[] }>(
    MAT_DIALOG_DATA
  );
  readonly panelOpenState = signal(false);

  close() {
    this.dialogRef.close();
  }
}
