import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { AuthService } from '../../account/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzDropDownModule,
    NzBreadCrumbModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class DashboardLayout {
  private authService = inject(AuthService);

  isCollapsed = false;
  user = this.authService.user;

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const name = this.user()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
