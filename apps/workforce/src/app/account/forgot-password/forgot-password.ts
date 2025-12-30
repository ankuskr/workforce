import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzStepsModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  currentStep = 0;
  userEmail = '';
  resendCountdown = 0;
  passwordVisible = false;
  private resendTimer: any;

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: any): { [key: string]: boolean } | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get confirmPasswordError(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.passwordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  async submitEmail(): Promise<void> {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const { email } = this.emailForm.value;

      const result = await this.authService.forgotPassword({ email });

      this.isLoading = false;

      if (result.success) {
        this.userEmail = email;
        this.currentStep = 1;
        this.toastr.success(result.message, 'Success');
        this.startResendCountdown();
      } else {
        this.toastr.error(result.message, 'Error');
      }
    }
  }

  async verifyOtp(): Promise<void> {
    if (this.otpForm.valid) {
      this.currentStep = 2;
    }
  }

  async resetPassword(): Promise<void> {
    if (this.passwordForm.valid && this.otpForm.valid) {
      this.isLoading = true;
      const { otp } = this.otpForm.value;
      const { newPassword } = this.passwordForm.value;

      const result = await this.authService.resetPassword({
        email: this.userEmail,
        code: otp,
        newPassword,
      });

      this.isLoading = false;

      if (result.success) {
        this.toastr.success(result.message, 'Success');
        this.router.navigate(['/account/login']);
      } else {
        this.toastr.error(result.message, 'Error');
      }
    }
  }

  async resendOtp(): Promise<void> {
    if (this.resendCountdown > 0) return;

    this.isLoading = true;
    const result = await this.authService.forgotPassword({ email: this.userEmail });
    this.isLoading = false;

    if (result.success) {
      this.toastr.success('Code resent successfully', 'Success');
      this.startResendCountdown();
    } else {
      this.toastr.error(result.message, 'Error');
    }
  }

  private startResendCountdown(): void {
    this.resendCountdown = 60;
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    this.resendTimer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  goBack(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
