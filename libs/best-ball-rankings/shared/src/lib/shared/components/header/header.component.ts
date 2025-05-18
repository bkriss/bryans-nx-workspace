import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFootball } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'shared-bbr-header',
  imports: [CommonModule, FontAwesomeModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  faFootball = faFootball;
}
