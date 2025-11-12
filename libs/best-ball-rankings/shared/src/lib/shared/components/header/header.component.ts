import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFootball } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'shared-bbr-header',
  imports: [FontAwesomeModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  faFootball = faFootball;
}
