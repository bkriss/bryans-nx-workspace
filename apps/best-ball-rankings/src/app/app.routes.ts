import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'rankings',
    loadChildren: () =>
      import('@bryans-nx-workspace/rankings').then((m) => m.rankingsRoutes),
  },
];
