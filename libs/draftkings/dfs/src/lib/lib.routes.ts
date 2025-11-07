import { Route } from '@angular/router';
import {
  DfsComponent,
  EntriesComponent,
  LineupBuildersPageComponent,
} from './components';

// TODO: setup lazy loading
export const dfsRoutes: Route[] = [
  { path: '', redirectTo: 'player-selection', pathMatch: 'full' },
  { path: 'player-selection', component: DfsComponent },
  { path: 'lineup-builders', component: LineupBuildersPageComponent },
  { path: 'entries', component: EntriesComponent },
];
