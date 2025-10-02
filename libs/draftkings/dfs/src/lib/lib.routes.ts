import { Route } from '@angular/router';
import { DfsComponent } from './components/dfs/dfs.component';
import { LineupBuildersPageComponent } from './components/lineup-builders-page/lineup-builders-page.component';

// TOOD: setup lazy loading for lineup-builders route
export const dfsRoutes: Route[] = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', component: DfsComponent },
  { path: 'lineup-builders', component: LineupBuildersPageComponent },
];
