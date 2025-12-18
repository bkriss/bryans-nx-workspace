import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  // MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'dfs-delete-confirmation-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrl: './delete-confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationModalComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteConfirmationModalComponent>);
  readonly data = inject<{ bodyText: string; headerText: string }>(
    MAT_DIALOG_DATA
  );

  close(deleteLineups: boolean): void {
    this.dialogRef.close(deleteLineups);
  }
}
