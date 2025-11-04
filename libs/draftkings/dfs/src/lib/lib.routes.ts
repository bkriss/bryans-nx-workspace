import { Route } from '@angular/router';
import { DfsComponent } from './components/dfs/dfs.component';
import { LineupBuildersPageComponent } from './components/lineup-builders-page/lineup-builders-page.component';
import { EntriesComponent } from './components/contests/entries.component';

// TOOD: setup lazy loading
export const dfsRoutes: Route[] = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', component: DfsComponent },
  { path: 'lineup-builders', component: LineupBuildersPageComponent },
  { path: 'entries', component: EntriesComponent },
];
