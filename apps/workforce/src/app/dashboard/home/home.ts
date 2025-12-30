import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../account/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class DashboardHome {
  private authService = inject(AuthService);
  user = this.authService.user;
}
