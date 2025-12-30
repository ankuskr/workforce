import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzSwitchModule,
    NzDividerModule,
  ],
  template: `
    <div class="settings-page">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <nz-card nzTitle="Notifications">
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium">Email Notifications</p>
            <p class="text-gray-500 text-sm">Receive email updates about your account</p>
          </div>
          <nz-switch [(ngModel)]="emailNotifications"></nz-switch>
        </div>
        <nz-divider></nz-divider>
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium">Push Notifications</p>
            <p class="text-gray-500 text-sm">Receive push notifications in your browser</p>
          </div>
          <nz-switch [(ngModel)]="pushNotifications"></nz-switch>
        </div>
      </nz-card>

      <nz-card nzTitle="Privacy" class="mt-4">
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium">Profile Visibility</p>
            <p class="text-gray-500 text-sm">Make your profile visible to other users</p>
          </div>
          <nz-switch [(ngModel)]="profileVisible"></nz-switch>
        </div>
      </nz-card>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class Settings {
  emailNotifications = true;
  pushNotifications = false;
  profileVisible = true;
}
