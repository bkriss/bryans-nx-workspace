import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '@bryans-nx-workspace/draftkings-shared';

@Component({
  imports: [HeaderComponent, RouterModule],
  selector: 'dk-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'draftkings';
}
