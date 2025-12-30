import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { AuthService } from '../../account/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    NzCardModule,
    NzAvatarModule,
    NzDescriptionsModule,
  ],
  template: `
    <div class="profile-page">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

      <nz-card>
        <div class="flex items-center gap-6 mb-6">
          <nz-avatar [nzText]="getUserInitials()" [nzSize]="80" class="bg-blue-500 text-2xl"></nz-avatar>
          <div>
            <h2 class="text-xl font-semibold">{{ user()?.name }}</h2>
            <p class="text-gray-500">{{ user()?.email }}</p>
          </div>
        </div>

        <nz-descriptions nzTitle="Account Information" nzBordered>
          <nz-descriptions-item nzTitle="Name">{{ user()?.name }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Email">{{ user()?.email }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Account ID">{{ user()?.id }}</nz-descriptions-item>
        </nz-descriptions>
      </nz-card>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class Profile {
  private authService = inject(AuthService);
  user = this.authService.user;

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
