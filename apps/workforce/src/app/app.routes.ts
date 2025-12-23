import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'account',
    loadChildren: () =>
      import('./account/account-module').then((m) => m.AccountModule),
  },
  {
    path: '',
    redirectTo: 'account/login',
    pathMatch: 'full',
  },
];
