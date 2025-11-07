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
  selector: 'dfs-lineup-validation-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './lineup-validation-modal.component.html',
  styleUrl: './lineup-validation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineupValidationModalComponent {
  readonly dialogRef = inject(MatDialogRef<LineupValidationModalComponent>);
  readonly data = inject<{ errorMessages: string[] }>(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }
}
