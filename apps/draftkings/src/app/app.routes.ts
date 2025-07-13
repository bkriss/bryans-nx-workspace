import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'best-ball',
    loadChildren: () =>
      import('@bryans-nx-workspace/best-ball').then((m) => m.bestBallRoutes),
  },
  {
    path: 'dfs',
    loadChildren: () =>
      import('@bryans-nx-workspace/dfs').then((m) => m.dfsRoutes),
  },
];
