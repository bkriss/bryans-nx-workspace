import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dfs',
    loadChildren: () =>
      import('@bryans-nx-workspace/dfs').then((m) => m.dfsRoutes),
  },
];
