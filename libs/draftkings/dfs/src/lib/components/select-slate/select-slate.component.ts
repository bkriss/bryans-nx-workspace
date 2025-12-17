import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Slate, SlatesStore } from '@bryans-nx-workspace/draftkings-shared';

@Component({
  selector: 'dfs-select-slate',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './select-slate.component.html',
  styleUrl: './select-slate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSlateComponent {
  private readonly slatesStore = inject(SlatesStore);
  isLoading = this.slatesStore.isLoading;
  isSaving = this.slatesStore.isSaving;

  currentSlate: Signal<Slate> = this.slatesStore.currentSlate;
  slatePool = [
    {
      name: 'Main Slate',
      id: Slate.MAIN,
    },
    {
      name: 'Early Only',
      id: Slate.EARLY_ONLY,
    },
    {
      name: 'Afternoon Only',
      id: Slate.AFTERNOON_ONLY,
    },
    {
      name: 'Sun-Mon',
      id: Slate.SUN_TO_MON,
    },
    {
      name: 'Thur-Mon',
      id: Slate.THUR_TO_MON,
    },
    {
      name: 'Thanksgiving',
      id: Slate.THANKSGIVING,
    },
  ];

  selectedNewSlate(slate: Slate) {
    this.slatesStore.updateSlateData({
      currentSlate: slate,
    });
  }
}
