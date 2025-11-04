import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '@bryans-nx-workspace/draftkings-shared';
import { NavLink } from '../models';

@Component({
  imports: [HeaderComponent, MatIconModule, MatTabsModule, RouterModule],
  selector: 'dk-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  activeRoute = window.location.pathname;
  links: NavLink[] = [
    { iconName: 'groups', label: 'Players', path: '/dfs/setup' },
    {
      iconName: 'construction',
      label: 'Lineups',
      path: '/dfs/lineup-builders',
    },
    { iconName: 'table_view', label: 'Entries', path: '/dfs/entries' },
  ];
}
