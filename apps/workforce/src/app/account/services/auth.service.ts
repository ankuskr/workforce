import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';

  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private authToken = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly token = this.authToken.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      this.currentUser.set(JSON.parse(storedUser));
      this.authToken.set(storedToken);
      this.isAuthenticated.set(true);
    }
  }

  async initiateSignup(credentials: SignupCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<MessageResponse>(`${this.API_URL}/signup`, credentials)
      );
      return { success: true, message: response.message };
    } catch (error: any) {
      const message = error?.error?.message || 'Signup failed. Please try again.';
      return { success: false, message };
    }
  }

  async verifyOtp(data: VerifyOtpData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/verify-otp`, data)
      );

      this.currentUser.set(response.user);
      this.authToken.set(response.token);
      this.isAuthenticated.set(true);

      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      return { success: true, message: 'Email verified successfully!' };
    } catch (error: any) {
      const message = error?.error?.message || 'OTP verification failed.';
      return { success: false, message };
    }
  }

  async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<MessageResponse>(`${this.API_URL}/resend-otp`, { email })
      );
      return { success: true, message: response.message };
    } catch (error: any) {
      const message = error?.error?.message || 'Failed to resend OTP.';
      return { success: false, message };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      );

      this.currentUser.set(response.user);
      this.authToken.set(response.token);
      this.isAuthenticated.set(true);

      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      const message = error?.error?.message || 'Invalid email or password.';
      return { success: false, message };
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<MessageResponse>(`${this.API_URL}/forgot-password`, data)
      );
      return { success: true, message: response.message };
    } catch (error: any) {
      const message = error?.error?.message || 'Failed to send reset email.';
      return { success: false, message };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<MessageResponse>(`${this.API_URL}/reset-password`, data)
      );
      return { success: true, message: response.message };
    } catch (error: any) {
      const message = error?.error?.message || 'Password reset failed.';
      return { success: false, message };
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.authToken.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/account/login']);
  }

  getAuthHeader(): { Authorization: string } | {} {
    const token = this.authToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
