import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayout } from './layout/layout';
import { DashboardHome } from './home/home';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: DashboardHome,
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile').then((m) => m.Profile),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings').then((m) => m.Settings),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardModule {}
