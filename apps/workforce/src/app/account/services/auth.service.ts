import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();

  constructor(private router: Router) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
      this.isAuthenticated.set(true);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    // Simulate API call - replace with actual API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo: accept any email/password combination for now
        if (credentials.email && credentials.password) {
          const user: User = {
            email: credentials.email,
            name: credentials.email.split('@')[0]
          };
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          localStorage.setItem('user', JSON.stringify(user));
          resolve({ success: true, message: 'Login successful' });
        } else {
          resolve({ success: false, message: 'Invalid credentials' });
        }
      }, 1000);
    });
  }

  async signup(credentials: SignupCredentials): Promise<{ success: boolean; message: string }> {
    // Simulate API call - replace with actual API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email && credentials.password && credentials.name) {
          const user: User = {
            email: credentials.email,
            name: credentials.name
          };
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          localStorage.setItem('user', JSON.stringify(user));
          resolve({ success: true, message: 'Account created successfully' });
        } else {
          resolve({ success: false, message: 'Please fill all fields' });
        }
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('user');
    this.router.navigate(['/account/login']);
  }
}
