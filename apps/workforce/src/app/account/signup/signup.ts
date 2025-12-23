import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzCheckboxModule,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  signupForm: FormGroup;
  isLoading = false;
  passwordVisible = false;

  constructor() {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  get confirmPasswordError(): string {
    const control = this.signupForm.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  passwordMatchValidator(
    form: AbstractControl,
  ): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.signupForm.value;

      const result = await this.authService.signup({ name, email, password });

      this.isLoading = false;

      if (result.success) {
        this.toastr.success(result.message, 'Success');
        this.router.navigate(['/']);
      } else {
        this.toastr.error(result.message, 'Error');
      }
    } else {
      Object.values(this.signupForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
    }
  }
}
