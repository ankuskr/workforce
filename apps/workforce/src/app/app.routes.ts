import { Route } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'account',
    loadChildren: () =>
      import('./account/account-module').then((m) => m.AccountModule),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
