import { Route } from '@angular/router';
import {
  EntriesComponent,
  LineupBuildersPageComponent,
  PlayerPoolSelectionComponent,
} from './components';
import { SlateSetupPageComponent } from './components/slate-setup-page/slate-setup-page.component';

// TODO: setup lazy loading
export const dfsRoutes: Route[] = [
  { path: '', redirectTo: 'slate-setup', pathMatch: 'full' },
  { path: 'slate-setup', component: SlateSetupPageComponent },
  { path: 'player-selection', component: PlayerPoolSelectionComponent },
  { path: 'lineup-builders', component: LineupBuildersPageComponent },
  { path: 'entries', component: EntriesComponent },
];
