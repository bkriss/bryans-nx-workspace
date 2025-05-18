import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { HeaderComponent } from '@bryans-nx-workspace/bbr/shared';

@Component({
  imports: [RouterModule],
  selector: 'best-ball-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'best-ball-rankings';
}
