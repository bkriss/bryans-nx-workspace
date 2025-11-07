import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Slate } from '../../enums';

@Component({
  selector: 'dfs-select-slate',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './select-slate.component.html',
  styleUrl: './select-slate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSlateComponent {
  currentSlate: Slate = Slate.MAIN;
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
      name: 'Sun-Mon',
      id: Slate.SUN_TO_MON,
    },
  ];

  selectedNewSlate(slate: Slate) {
    // TODO: Save selected slate to NgRx Signal Store
    console.log('Selected new slate:', slate);
  }
}
