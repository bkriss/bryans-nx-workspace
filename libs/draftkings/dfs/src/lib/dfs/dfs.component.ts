import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dfs-dfs',
  imports: [CommonModule],
  templateUrl: './dfs.component.html',
  styleUrl: './dfs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DfsComponent {}
