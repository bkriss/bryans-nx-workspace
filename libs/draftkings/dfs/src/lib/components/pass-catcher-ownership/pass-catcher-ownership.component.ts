import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PassCatcher, Position } from '@bryans-nx-workspace/draftkings-shared';

@Component({
  selector: 'dfs-pass-catcher-ownership',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './pass-catcher-ownership.component.html',
  styleUrl: './pass-catcher-ownership.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassCatcherOwnershipComponent {
  @Input() minPropertyName:
    | 'minOwnershipWhenPairedWithQb'
    | 'minOwnershipWhenPairedWithOpposingQb' = 'minOwnershipWhenPairedWithQb';
  @Input() maxPropertyName:
    | 'maxOwnershipWhenPairedWithQb'
    | 'maxOwnershipWhenPairedWithOpposingQb' = 'maxOwnershipWhenPairedWithQb';
  @Input({ required: true }) player!: PassCatcher;
  position = Position;

  updateValue(event: Event, minOrMax: 'min' | 'max') {
    if (minOrMax === 'max') {
      this.player[this.maxPropertyName] = Number(
        (event.target as HTMLInputElement).value
      );
    } else {
      this.player[this.minPropertyName] = Number(
        (event.target as HTMLInputElement).value
      );
    }
  }
}
